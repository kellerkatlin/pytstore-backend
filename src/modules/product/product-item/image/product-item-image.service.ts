import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductItemImageDto } from './dto/create-product-item-image.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class ProductItemImageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductItemImageDto) {
    const item = await this.prisma.productItem.findUnique({
      where: { id: dto.itemId },
    });

    if (!item) throw new NotFoundException('Ítem no encontrado');

    if (dto.isPrimary) {
      // Desmarcar anteriores
      await this.prisma.productItemImage.updateMany({
        where: { itemId: dto.itemId },
        data: { isPrimary: false },
      });
    }

    const image = await this.prisma.productItemImage.create({
      data: {
        itemId: dto.itemId,
        imageUrl: dto.imageUrl,
        isPrimary: dto.isPrimary ?? false,
      },
    });

    return created(image, 'Imagen registrada correctamente');
  }

  async findByItem(itemId: number) {
    const images = await this.prisma.productItemImage.findMany({
      where: { itemId },
      orderBy: { isPrimary: 'desc' },
    });

    return ok(images, 'Imágenes del ítem');
  }
  async findRawByItem(itemId: number) {
    const images = await this.prisma.productItemImage.findMany({
      where: { itemId },
      orderBy: { isPrimary: 'desc' },
    });

    return images.map((img) => img.imageUrl);
  }

  async remove(id: number) {
    await this.prisma.productItemImage.delete({ where: { id } });
    return ok(null, 'Imagen eliminada');
  }
}
