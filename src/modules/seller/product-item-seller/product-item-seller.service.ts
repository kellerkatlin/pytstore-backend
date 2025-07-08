import { Injectable, NotFoundException } from '@nestjs/common';
import { paginated } from 'src/common/helpers/response.helper';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FilterUniqueProductDto } from './dto/filter-unique-product.dto';
import { ProductItemImageService } from 'src/modules/product/product-item/image/product-item-image.service';

@Injectable()
export class ProductItemSellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productItemImageService: ProductItemImageService,
  ) {}

  async findAll(query: FilterUniqueProductDto) {
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

    const [items, total] = await this.prisma.$transaction([
      this.prisma.productItem.findMany({
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
        take: Number(limit),
        skip,
        orderBy: { [sortBy]: order },
        include: {
          product: {
            select: {
              title: true,
              brand: { select: { name: true } },
              commissionValue: true,
              commissionType: true,
              gainValue: true,
              gainType: true,
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
      }),

      this.prisma.productItem.count({
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
      }),
    ]);

    // Obtener IDs para buscar costos adicionales
    const itemIds = items.map((i) => i.id);
    const extraCosts = await this.prisma.productCostDetail.findMany({
      where: {
        productItemId: { in: itemIds },
        origin: 'PURCHASE',
      },
    });

    // Agrupar costos adicionales por itemId
    const costMap = new Map<number, number>();
    for (const cost of extraCosts) {
      if (!cost.productItemId) continue;
      const current = costMap.get(cost.productItemId) ?? 0;
      costMap.set(cost.productItemId, current + cost.amount);
    }

    const mappedData = items.map((item) => {
      const baseCost = item.purchaseItem?.unitCost ?? 0;
      const extraCost = costMap.get(item.id) ?? 0;
      const unitCost = baseCost + extraCost;

      const gainType = item.gainType ?? item.product.gainType;
      const gainValue = item.gainValue ?? item.product.gainValue;

      const utilidadEstim =
        gainType === 'PERCENT'
          ? (unitCost * (gainValue ?? 0)) / 100
          : (gainValue ?? 0);

      const estimatedSalePrice = unitCost + utilidadEstim;

      const salePrice = estimatedSalePrice;

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
        brandName: item.product.brand.name,
        serialCode: item.serialCode,
        salePrice,
        profit,
        createdAt: item.createdAt,
        imagenUrl: item.images[0]?.imageUrl ?? null,
      };
    });

    return paginated(
      mappedData,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Listado de productos únicos disponibles',
    );
  }

  async findDetailById(id: number) {
    const item = await this.prisma.productItem.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
        purchaseItem: {
          select: { unitCost: true },
        },
        attributes: {
          include: {
            attribute: true,
            value: true,
          },
        },
      },
    });

    if (!item) throw new NotFoundException('Producto no encontrado');

    const images = await this.productItemImageService.findRawByItem(id);

    const commissionValue =
      item.commissionValue ?? item.product.commissionValue;
    const commissionType = item.commissionType ?? item.product.commissionType;
    const costoUnitario = item.purchaseItem?.unitCost ?? 0;
    let profit: number | null = null;

    if (item.salePrice != null && costoUnitario != null) {
      const utilidad = item.salePrice - costoUnitario;

      if (commissionType === 'PERCENT') {
        profit = (utilidad * commissionValue) / 100;
      } else if (commissionType === 'FIXED') {
        profit = commissionValue;
      }
    }
    const attributes = item.attributes.map((attr) => ({
      attribute: attr.attribute.name,
      value: attr.value.value,
    }));

    return {
      id: item.id,
      productTitle: item.product.title,
      brandName: item.product.brand.name,
      serialCode: item.serialCode,
      salePrice: item.salePrice,
      profit,
      description: item.description,
      createdAt: item.createdAt,
      attributes,
      images,
    };
  }
}
