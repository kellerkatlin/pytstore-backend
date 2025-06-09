import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductItemDto } from './dto/create-product-item.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class ProductItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || product.status === 'DELETED') {
      throw new NotFoundException('Producto no encontrado');
    }

    const exists = await this.prisma.productItem.findUnique({
      where: { serialCode: dto.serialCode },
    });
    if (exists) {
      throw new ConflictException('Ya existe un ítem con este código de serie');
    }

    const item = await this.prisma.productItem.create({
      data: dto,
    });

    return created(item, 'Ítem registrado correctamente');
  }

  async findByProduct(productId: number) {
    const items = await this.prisma.productItem.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    return ok(items, 'Ítems del producto');
  }

  async remove(id: number) {
    const item = await this.prisma.productItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Ítem no encontrado');

    await this.prisma.productItem.delete({ where: { id } });
    return ok(null, 'Ítem eliminado correctamente');
  }
}
