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
}
