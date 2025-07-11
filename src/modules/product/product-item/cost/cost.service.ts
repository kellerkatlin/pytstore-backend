import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductItemCostDto } from './dto/create-product-item-cost.dto';
import { UpdateProductItemCostDto } from './dto/update-product-item-cost.dto';
import { created, ok } from 'src/common/helpers/response.helper';
import { CapitalAccountName } from '@prisma/client';

@Injectable()
export class CostService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAccountId(name: CapitalAccountName): Promise<number> {
    const account = await this.prisma.capitalAccount.findUnique({
      where: { name },
    });
    if (!account) {
      throw new NotFoundException(`Cuenta contable ${name} no encontrada`);
    }
    return account.id;
  }

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

    if (result.origin === 'PURCHASE') {
      const cashId = await this.getAccountId('CASH');

      await this.prisma.capitalTransaction.create({
        data: {
          amount: result.amount,
          type: 'PURCHASE_EXPENSE',
          referenceType: 'PURCHASE',
          referenceId: result.id,
          description: `Gasto adicional por compra: ${result.description}`,
          originAccountId: cashId,
        },
      });
    }

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

    if (updated.origin === 'PURCHASE') {
      const existingTx = await this.prisma.capitalTransaction.findFirst({
        where: {
          referenceId: updated.id,
          referenceType: 'PURCHASE',
          type: 'PURCHASE_EXPENSE',
        },
      });

      const cashId = await this.getAccountId('CASH');

      if (existingTx) {
        await this.prisma.capitalTransaction.update({
          where: { id: existingTx.id },
          data: {
            amount: updated.amount,
            description: `Gasto adicional por compra: ${updated.description}`,
          },
        });
      } else {
        await this.prisma.capitalTransaction.create({
          data: {
            amount: updated.amount,
            type: 'PURCHASE_EXPENSE',
            referenceType: 'PURCHASE',
            referenceId: updated.id,
            description: `Gasto adicional por compra: ${updated.description}`,
            originAccountId: cashId,
          },
        });
      }
    }

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

    if (deleted.origin === 'PURCHASE') {
      await this.prisma.capitalTransaction.deleteMany({
        where: {
          referenceId: deleted.id,
          referenceType: 'PURCHASE',
          type: 'PURCHASE_EXPENSE',
        },
      });
    }

    return ok(deleted, 'Eliminado correctamente');
  }
}
