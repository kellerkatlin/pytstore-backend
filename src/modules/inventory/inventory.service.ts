import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInventoryMovementDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || product.status === 'DELETED') {
      throw new NotFoundException('Producto no encontrado');
    }

    const movement = await this.prisma.inventoryMovement.create({
      data: {
        ...dto,
      },
    });

    return created(movement, 'Movimiento de inventario registrado');
  }

  async findByProduct(productId: number) {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    return ok(movements, 'Movimientos del producto');
  }
}
