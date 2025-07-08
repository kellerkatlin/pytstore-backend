import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { created, ok, paginated } from 'src/common/helpers/response.helper';
import { FilterProductDto } from './dto/filter-product.dto';
import { ProductStatus } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { StockService } from 'src/common/services/stock/stock.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockService: StockService,
  ) {}

  private readonly select = {
    id: true,
    title: true,
    description: true,
    commissionType: true,
    commissionValue: true,
    categoryId: true,
    brandId: true,
    status: true,
    images: true,
    createdAt: true,
    updatedAt: true,
    category: { select: { id: true, name: true } },
    brand: { select: { id: true, name: true } },
  };

  private async validateRelations(categoryId: number, brandId: number) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, isDeleted: false },
    });
    if (!category) throw new NotFoundException('Categoría no válida');

    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, isDeleted: false },
    });
    if (!brand) throw new NotFoundException('Marca no válida');
  }

  async create(dto: CreateProductDto) {
    await this.validateRelations(dto.categoryId, dto.brandId);

    const { images, ...rest } = dto;

    if (images?.length) {
      const hasPrimary = images.some((img) => img.isPrimary);
      if (!hasPrimary) {
        images[0].isPrimary = true;
      }
    }
    const product = await this.prisma.product.create({
      data: {
        ...rest,
        status: 'ACTIVE',
        images: images?.length
          ? {
              create: images.map((img) => ({
                imageUrl: img.imageUrl,
                isPrimary: img.isPrimary,
              })),
            }
          : undefined,
      },
      select: this.select,
    });

    return created(product, 'Producto creado correctamente');
  }

  async findAll(query: FilterProductDto) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order },
        where: {
          status: { not: ProductStatus.DELETED },
          title: { contains: search, mode: 'insensitive' },
        },
        select: this.select,
      }),
      this.prisma.product.count({
        where: {
          status: { not: ProductStatus.DELETED },
          title: { contains: search, mode: 'insensitive' },
        },
      }),
    ]);

    return paginated(
      data,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Listado de productos',
    );
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, status: { not: 'DELETED' } },
      select: this.select,
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    return ok(product, 'Producto encontrado');
  }

  async getAttributeValueTree(productId: number) {
    const attributes = await this.prisma.productAttribute.findMany({
      where: { productId },
      include: {
        attribute: { select: { id: true, name: true } },
        values: {
          include: {
            value: { select: { id: true, value: true } },
          },
        },
      },
      orderBy: { attribute: { name: 'asc' } },
    });

    const result = attributes.map((attr) => ({
      attributeId: attr.attribute.id,
      name: attr.attribute.name,
      values: attr.values.map((v) => ({
        valueId: v.value.id,
        value: v.value.value,
      })),
    }));

    return ok({ productId, attributes: result });
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product || product.status === 'DELETED') {
      throw new NotFoundException('Producto no encontrado');
    }

    if (dto.categoryId || dto.brandId) {
      await this.validateRelations(
        dto.categoryId ?? product.categoryId,
        dto.brandId ?? product.brandId,
      );
    }

    const { images, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Actualizar producto
      const updated = await tx.product.update({
        where: { id },
        data: { ...rest },
        select: this.select,
      });

      if (images) {
        // Eliminar imágenes antiguas
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        const imagesToCreate = images.map((img) => ({
          productId: id,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary ?? false,
        }));

        const hasPrimary = imagesToCreate.some((img) => img.isPrimary);
        if (!hasPrimary && imagesToCreate.length > 0) {
          imagesToCreate[0].isPrimary = true;
        }

        await tx.productImage.createMany({
          data: imagesToCreate,
        });
      }

      return ok(updated, 'Producto actualizado correctamente');
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || product.status === 'DELETED') {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.prisma.product.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return ok(null, 'Producto eliminado correctamente');
  }

  async calculateStock(productId: number): Promise<number> {
    return this.stockService.getTotalStock(productId);
  }
}
