import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductItemDto } from './dto/create-product-item.dto';
import { created, ok, paginated } from 'src/common/helpers/response.helper';

import { UpdateProductItemDto } from './dto/update-product-item.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { ProductItemStatus } from '@prisma/client';

@Injectable()
export class ProductItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        attributes: {
          include: {
            attribute: {
              include: { values: true },
            },
          },
        },
      },
    });

    if (!product || product.status === 'DELETED') {
      throw new NotFoundException('Producto no encontrado');
    }

    if (!dto.gainType || dto.gainValue == null) {
      throw new BadRequestException(
        'Debes definir el tipo y valor de ganancia',
      );
    }

    const exists = await this.prisma.productItem.findUnique({
      where: { serialCode: dto.serialCode },
    });

    if (exists) {
      throw new ConflictException('Ya existe un ítem con este código de serie');
    }

    const item = await this.prisma.productItem.create({
      data: {
        productId: dto.productId,
        serialCode: dto.serialCode,
        salePrice: undefined,
        taxType: dto.taxType,
        status: 'NOT_AVAILABLE',
        commissionType: dto.commissionType,
        commissionValue: dto.commissionValue,
        gainType: dto.gainType,
        gainValue: dto.gainValue,
        description: dto.description,
      },
    });

    // registrar atributos si vienen

    if (dto.attributes?.length) {
      const validAttributeMap = new Map<number, Set<number>>();

      for (const pa of product.attributes) {
        const attrId = pa.attributeId;
        const valueIds = new Set(pa.attribute.values.map((v) => v.id));
        validAttributeMap.set(attrId, valueIds);
      }

      const invalidAttributes = dto.attributes.filter(
        (attr) =>
          !validAttributeMap.has(attr.attributeId) ||
          !validAttributeMap.get(attr.attributeId)?.has(attr.valueId),
      );

      if (invalidAttributes.length > 0) {
        throw new BadRequestException(
          `Algunos atributos o valores no pertenecen al producto base.`,
        );
      }

      await this.prisma.productItemAttribute.createMany({
        data: dto.attributes.map((attr) => ({
          itemId: item.id,
          attributeId: attr.attributeId,
          valueId: attr.valueId,
        })),
      });
    }

    // Registrar imágenes si se proporcionan
    if (dto.images?.length) {
      const imagesToCreate = dto.images.map((img) => ({
        itemId: item.id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary ?? false,
      }));

      // Asegurar que solo sea principal
      const hasPrimary = imagesToCreate.some((img) => img.isPrimary);
      if (!hasPrimary && imagesToCreate.length > 0) {
        imagesToCreate[0].isPrimary = true;
      }
      await this.prisma.productItemImage.createMany({
        data: imagesToCreate,
      });
    }

    return created(item, 'Ítem registrado correctamente');
  }

  async findAllUniqueProducts(query: FilterProductDto) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const isNumeric = !isNaN(Number(search));
    const searchNumber = Number(search);

    const items = await this.prisma.productItem.findMany({
      where: {
        AND: [
          { product: { isActive: true, status: 'ACTIVE' } },
          {
            OR: [
              {
                product: { title: { contains: search, mode: 'insensitive' } },
              },
              {
                product: {
                  brand: { name: { contains: search, mode: 'insensitive' } },
                },
              },
              { serialCode: { contains: search, mode: 'insensitive' } },
              ...(isNumeric ? [{ salePrice: searchNumber }] : []),
            ],
          },
        ],
      },
      include: {
        product: {
          select: {
            title: true,
            brand: { select: { name: true } },
            commissionValue: true,
            commissionType: true,
            gainType: true,
            gainValue: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        purchaseItem: {
          select: { unitCost: true },
        },
      },
    });

    const itemIds = items.map((i) => i.id);

    const extraCosts = await this.prisma.productCostDetail.findMany({
      where: {
        productItemId: { in: itemIds },
        origin: 'PURCHASE',
      },
    });

    const costMap = new Map<number, number>();
    for (const cost of extraCosts) {
      if (!cost.productItemId) continue;
      const current = costMap.get(cost.productItemId) ?? 0;
      costMap.set(cost.productItemId, current + cost.amount);
    }

    const mapped = items.map((item) => {
      const baseCost = item.purchaseItem?.unitCost ?? 0;
      const extraCost = costMap.get(item.id) ?? 0;
      const unitCost = baseCost + extraCost;

      const gainType = item.gainType ?? item.product.gainType;
      const gainValue = item.gainValue ?? item.product.gainValue;

      // 🔁 Calculamos un precio sugerido dinámicamente
      const utilidadEstim =
        gainType === 'PERCENT'
          ? (unitCost * (gainValue ?? 0)) / 100
          : (gainValue ?? 0);

      const estimatedSalePrice = unitCost + utilidadEstim;

      const salePrice = estimatedSalePrice; // <-- 🔄 usarlo como precio real si así lo deseas
      const isGravado = (item.taxType ?? 'GRAVADO') === 'GRAVADO';
      const baseVenta = isGravado ? salePrice / 1.18 : salePrice;
      const utilidad = baseVenta - unitCost;

      const commissionType = item.commissionType ?? item.product.commissionType;
      const commissionValue =
        item.commissionValue ?? item.product.commissionValue;

      let profit: number | null = null;
      if (commissionType === 'PERCENT') {
        profit = (utilidad * commissionValue) / 100;
      } else if (commissionType === 'FIXED') {
        profit = commissionValue;
      }

      return {
        id: item.id,
        productId: item.productId,
        productTitle: item.product.title,
        taxType: item.taxType ?? 'GRAVADO',
        brandName: item.product.brand.name,
        serialCode: item.serialCode,
        salePrice,
        unitCost,
        utilidad,
        profit,
        estimatedSalePrice,
        status: item.status,
        createdAt: item.createdAt,
        imageUrl: item.images.find((i) => i.isPrimary === true)?.imageUrl,
      };
    });
    const statusOrder: ProductItemStatus[] = [
      'NOT_AVAILABLE',
      'ORDERED',
      'IN_STOCK',
      'SOLD',
    ];

    const sortedMapped = [...mapped].sort((a, b) => {
      const statusA = statusOrder.indexOf(a.status);
      const statusB = statusOrder.indexOf(b.status);

      if (statusA !== statusB) {
        return statusA - statusB; // ordena por status primero
      }

      // Si tienen el mismo status, ordena por createdAt descendente
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const paginatedItems = sortedMapped.slice(skip, skip + limit);
    return paginated(
      paginatedItems,
      {
        total: sortedMapped.length,
        page,
        lastPage: Math.ceil(sortedMapped.length / limit),
      },
      'Listado de productos únicos disponibles',
    );
  }

  async findByUniqueProduct(productItemId: number) {
    const item = await this.prisma.productItem.findUnique({
      where: { id: productItemId },
      include: {
        images: true,
        purchaseItem: { select: { id: true, unitCost: true } },
        attributes: true,
        product: {
          select: {
            gainType: true,
            gainValue: true,
          },
        },
      },
    });

    if (!item) throw new NotFoundException('Producto no encontrado');

    // 🔹 Sumar costos extra
    const extraCosts = await this.prisma.productCostDetail.findMany({
      where: {
        productItemId,
        origin: 'PURCHASE',
      },
    });

    const baseUnitCost = item.purchaseItem?.unitCost ?? 0;
    const extraCostSum = extraCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const unitCost = baseUnitCost + extraCostSum;

    // 🔹 Obtener valores de ganancia desde el ítem o el producto padre
    const gainType = item.gainType ?? item.product.gainType;
    const gainValue = item.gainValue ?? item.product.gainValue;

    // 🔹 Calcular precio si hay datos suficientes
    let salePrice = item.salePrice ?? null;

    if (gainType && gainValue != null) {
      const utilidad =
        gainType === 'PERCENT' ? (unitCost * gainValue) / 100 : gainValue;

      salePrice = unitCost + utilidad;
    }

    return ok(
      {
        ...item,
        unitCost, // ✅ Incluido ahora correctamente
        salePrice, // ✅ Calculado si aplica
      },
      'Ítem encontrado correctamente',
    );
  }

  async update(id: number, dto: UpdateProductItemDto) {
    const item = await this.prisma.productItem.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!item) {
      throw new NotFoundException('Ítem no encontrado');
    }

    if (!dto.gainType || dto.gainValue == null) {
      throw new BadRequestException(
        'Debes definir el tipo y valor de ganancia',
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        attributes: {
          include: {
            attribute: { include: { values: true } },
          },
        },
      },
    });

    if (!product || product.status === 'DELETED') {
      throw new NotFoundException('Producto no encontrado');
    }

    const serialExists = await this.prisma.productItem.findFirst({
      where: {
        serialCode: dto.serialCode,
        NOT: { id }, // evitar colisión consigo mismo
      },
    });

    if (serialExists) {
      throw new ConflictException('Ya existe un ítem con este código de serie');
    }

    const updatedItem = await this.prisma.productItem.update({
      where: { id },
      data: {
        productId: dto.productId,
        serialCode: dto.serialCode,
        taxType: dto.taxType,
        gainType: dto.gainType,
        gainValue: dto.gainValue,
        salePrice: dto.salePrice,
        commissionType: dto.commissionType,
        commissionValue: dto.commissionValue,
        description: dto.description,
      },
    });

    // ✅ Actualizar atributos si se proporcionan
    if (dto.attributes) {
      // Validar contra atributos válidos del producto
      const validAttributeMap = new Map<number, Set<number>>();
      for (const pa of product.attributes) {
        validAttributeMap.set(
          pa.attributeId,
          new Set(pa.attribute.values.map((v) => v.id)),
        );
      }

      const invalidAttributes = dto.attributes.filter(
        (attr) =>
          !validAttributeMap.has(attr.attributeId) ||
          !validAttributeMap.get(attr.attributeId)?.has(attr.valueId),
      );

      if (invalidAttributes.length > 0) {
        throw new BadRequestException(
          `Algunos atributos o valores no pertenecen al producto base.`,
        );
      }

      // Eliminar atributos anteriores
      await this.prisma.productItemAttribute.deleteMany({
        where: { itemId: id },
      });

      // Insertar nuevos
      await this.prisma.productItemAttribute.createMany({
        data: dto.attributes.map((attr) => ({
          itemId: id,
          attributeId: attr.attributeId,
          valueId: attr.valueId,
        })),
      });
    }

    // Actualizar imágenes si se proporcionan
    if (dto.images) {
      // Eliminar imágenes anteriores
      await this.prisma.productItemImage.deleteMany({
        where: { itemId: id },
      });

      const imagesToCreate = dto.images.map((img) => ({
        itemId: id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary ?? false,
      }));

      // Asegurar que una imagen sea marcada como principal
      const hasPrimary = imagesToCreate.some((img) => img.isPrimary);
      if (!hasPrimary && imagesToCreate.length > 0) {
        imagesToCreate[0].isPrimary = true;
      }

      await this.prisma.productItemImage.createMany({
        data: imagesToCreate,
      });
    }

    return ok(updatedItem, 'Ítem actualizado correctamente');
  }

  async remove(id: number) {
    const item = await this.prisma.productItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Ítem no encontrado');

    await this.prisma.productItem.delete({ where: { id } });
    return ok(null, 'Ítem eliminado correctamente');
  }
}
