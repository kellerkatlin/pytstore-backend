import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class ProductImageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductImageDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (dto.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId: dto.productId },
        data: { isPrimary: false },
      });
    }

    const image = await this.prisma.productImage.create({
      data: dto,
    });

    return created(image, 'Imagen agregada correctamente');
  }

  async findByProduct(productId: number) {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
    });
    return ok(images, 'Imágenes del producto');
  }

  async remove(id: number) {
    await this.prisma.productImage.delete({ where: { id } });
    return ok(null, 'Imagen eliminada');
  }
}
