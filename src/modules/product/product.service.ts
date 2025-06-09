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
    price: true,
    stock: true,
    commissionType: true,
    commissionValue: true,
    categoryId: true,
    brandId: true,
    status: true,
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

    const product = await this.prisma.product.create({
      data: {
        ...dto,
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
      where: { id, status: { not: ProductStatus.DELETED } },
      select: this.select,
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    return ok(product, 'Producto encontrado');
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || product.status === ProductStatus.DELETED) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (dto.categoryId || dto.brandId) {
      await this.validateRelations(
        dto.categoryId ?? product.categoryId,
        dto.brandId ?? product.brandId,
      );
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: { ...dto },
      select: this.select,
    });

    return ok(updated, 'Producto actualizado correctamente');
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || product.status === ProductStatus.DELETED) {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.DELETED },
    });

    return ok(null, 'Producto eliminado correctamente');
  }

  async calculateStock(productId: number): Promise<number> {
    return this.stockService.getTotalStock(productId);
  }
}
