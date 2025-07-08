import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductItemCostDto } from './dto/create-product-item-cost.dto';
import { UpdateProductItemCostDto } from './dto/update-product-item-cost.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class CostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByItem(itemId: number) {
    const result = await this.prisma.productCostDetail.findMany({
      where: { productItemId: itemId },
      orderBy: { createdAt: 'desc' },
    });

    return ok(result, 'Listados correctamente');
  }

  async findOne(itemId: number, costId: number) {
    const result = await this.prisma.productCostDetail.findFirst({
      where: {
        id: costId,
        productItemId: itemId,
      },
    });

    if (!result) {
      throw new NotFoundException('Gasto no encontrado para este producto');
    }

    return ok(result, 'Cargado correctamente');
  }

  async create(itemId: number, dto: CreateProductItemCostDto) {
    const result = await this.prisma.productCostDetail.create({
      data: {
        productItemId: itemId,
        origin: 'PURCHASE',
        ...dto,
      },
    });

    return created(result, 'Creado correctamente');
  }

  async update(itemId: number, costId: number, dto: UpdateProductItemCostDto) {
    const existing = await this.prisma.productCostDetail.findFirst({
      where: { id: costId, productItemId: itemId },
    });

    if (!existing)
      throw new NotFoundException('Gasto no encontrado para este producto');

    const updated = await this.prisma.productCostDetail.update({
      where: { id: costId },
      data: {
        ...dto,
        origin: 'PURCHASE',
      },
    });
    return ok(updated, 'Actualizado correctamente');
  }

  async remove(itemId: number, costId: number) {
    const existing = await this.prisma.productCostDetail.findFirst({
      where: { id: costId, productItemId: itemId },
    });

    if (!existing)
      throw new NotFoundException('Gasto no encontrado para este producto');

    const deleted = await this.prisma.productCostDetail.delete({
      where: { id: costId },
    });
    return ok(deleted, 'Eliminado correctamente');
  }
}
