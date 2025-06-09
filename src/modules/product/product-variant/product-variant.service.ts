import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class ProductVariantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const exists = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });
    if (exists) throw new ConflictException('SKU ya registrado');

    const variant = await this.prisma.productVariant.create({ data: dto });
    return created(variant, 'Variante creada correctamente');
  }

  async findByProduct(productId: number) {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
    });
    return ok(variants, 'Variantes del producto');
  }

  async remove(id: number) {
    await this.prisma.productVariant.delete({ where: { id } });
    return ok(null, 'Variante eliminada');
  }

  async generateSku(variantId: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        attributes: {
          include: {
            attribute: true,
            value: true,
          },
          orderBy: {
            attributeId: 'asc',
          },
        },
      },
    });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    const prefix = variant.product.title
      .replace(/\s+/g, '')
      .substring(0, 6)
      .toUpperCase();

    const parts = variant.attributes.map((attr) =>
      attr.value.value.replace(/\s+/g, '').toUpperCase(),
    );

    const sku = [prefix, ...parts].join('-');
    // validacion de la unidad
    const existing = await this.prisma.productVariant.findUnique({
      where: { sku },
    });

    if (existing && existing.id !== variantId) {
      throw new ConflictException('SKU generado ya existe');
    }

    // guardar el SKU

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { sku },
    });

    return ok(updated, 'SKU generado correctamente');
  }

  async calculateStockByVariant(variantId: number): Promise<number> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    const movimientos = await this.prisma.inventoryMovement.groupBy({
      by: ['direction'],
      where: { variantId }, // ahora filtramos por variante directamente
      _sum: { quantity: true },
    });

    const inQty =
      movimientos.find((m) => m.direction === 'IN')?._sum.quantity ?? 0;
    const outQty =
      movimientos.find((m) => m.direction === 'OUT')?._sum.quantity ?? 0;

    return inQty - outQty;
  }
}
