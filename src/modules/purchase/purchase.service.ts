import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreatePurchaseProductUniqueDto } from './dto/create-purchase-product-unique.dto';
import { created } from 'src/common/helpers/response.helper';
import { CapitalAccountName, Prisma } from '@prisma/client';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  private async calculateCashBalance(
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const cashAccount = await tx.capitalAccount.findUnique({
      where: { name: 'CASH' },
      include: { transactions: true },
    });
    if (!cashAccount) throw new NotFoundException('Cuenta CASH no encontrada');

    return cashAccount.transactions.reduce((acc, t) => {
      const sign = ['INJECTION', 'SALE_PROFIT', 'TRANSFER_IN'].includes(t.type)
        ? 1
        : -1;
      return acc + t.amount * sign;
    }, 0);
  }

  async createForVariantsOrMassive(dto: CreatePurchaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const totalGasto = dto.items.reduce(
        (acc, i) => acc + i.unitCost * i.quantity,
        0,
      );

      const cashId = await this.getAccountIdByName('CASH');
      const inventoryId = await this.getAccountIdByName('INVENTORY');

      const saldo = await this.calculateCashBalance(tx);
      if (totalGasto > saldo) {
        throw new BadRequestException('Fondos insuficientes en caja');
      }

      const purchase = await tx.purchase.create({
        data: {
          providerName: dto.providerName,
          invoiceCode: dto.invoiceCode,
          purchaseDate: new Date(dto.purchaseDate),
          documentUrl: dto.documentUrl,
        },
      });

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) throw new NotFoundException('Producto no encontrado');

        const purchaseItem = await tx.purchaseItem.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            purchaseId: purchase.id,
            quantity: item.quantity,
            unitCost: item.unitCost,
            status: 'RECEIVED',
          },
        });

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            sourceType: 'PURCHASE',
            sourceId: purchaseItem.id,
            quantity: item.quantity,
            direction: 'IN',
            reason: `Ingreso por compra (${dto.invoiceCode})`,
          },
        });

        await tx.capitalTransaction.create({
          data: {
            amount: item.unitCost * item.quantity,
            type: 'TRANSFER_OUT',
            referenceType: 'PURCHASE',
            referenceId: purchase.id,
            description: `Compra de stock (${item.quantity})`,
            originAccountId: cashId,
            accountId: inventoryId,
          },
        });
      }

      return created(purchase, 'Compra de variantes registrada');
    });
  }

  async createForUniqueItems(dto: CreatePurchaseProductUniqueDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Calcular el total a gastar
      const totalGasto = dto.items.reduce(
        (acc, item) => acc + item.unitCost,
        0,
      );

      // 2. Validar si hay saldo suficiente en CASH
      const cashAccount = await tx.capitalAccount.findUnique({
        where: { name: 'CASH' },
        include: { transactions: true },
      });

      if (!cashAccount)
        throw new NotFoundException('Cuenta CASH no encontrada');

      const saldoDisponible = cashAccount.transactions.reduce((acc, tx) => {
        const sign = ['INJECTION', 'SALE_PROFIT', 'TRANSFER_IN'].includes(
          tx.type,
        )
          ? 1
          : -1;
        return acc + sign * tx.amount;
      }, 0);
      if (totalGasto > saldoDisponible) {
        throw new BadRequestException('Fondos insuficientes en caja');
      }

      // 3. Crear la compra
      const purchase = await tx.purchase.create({
        data: {
          providerName: dto.providerName,
          invoiceCode: dto.invoiceCode,
          purchaseDate: new Date(dto.purchaseDate),
          documentUrl: dto.documentUrl,
        },
      });

      for (const item of dto.items) {
        const prodItem = await tx.productItem.findUnique({
          where: { id: item.productItemId },
          include: { product: true },
        });

        if (!prodItem) {
          throw new NotFoundException(
            `Item único ${item.productItemId} no encontrado`,
          );
        }

        if (prodItem.status !== 'NOT_AVAILABLE') {
          throw new BadRequestException(
            `El producto con serial ${prodItem.serialCode} ya fue comprado`,
          );
        }

        const purchaseItem = await tx.purchaseItem.create({
          data: {
            productId: prodItem.productId,
            purchaseId: purchase.id,
            quantity: 1,
            unitCost: item.unitCost,
            status: 'RECEIVED',
          },
        });

        const gainType = prodItem.gainType ?? prodItem.product.gainType;
        const gainValue = prodItem.gainValue ?? prodItem.product.gainValue;

        if (gainType == null || gainValue == null) {
          throw new BadRequestException(
            `El producto único o su producto base no tienen configurado un margen de ganancia`,
          );
        }

        let salePrice = item.unitCost;
        if (gainType === 'PERCENT') {
          salePrice = item.unitCost * (1 + gainValue / 100);
        } else if (gainType === 'FIXED') {
          salePrice = item.unitCost + gainValue;
        }

        await tx.productItem.update({
          where: { id: prodItem.id },
          data: {
            purchaseItemId: purchaseItem.id,
            status: 'ORDERED',
            salePrice,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: prodItem.productId,
            sourceId: purchaseItem.id,
            sourceType: 'PURCHASE',
            quantity: 1,
            direction: 'IN',
            reason: `Ingreso por compra única (${dto.invoiceCode})`,
          },
        });
        const [cashId, inventoryId] = await Promise.all([
          tx.capitalAccount
            .findUnique({ where: { name: 'CASH' } })
            .then((a) => a?.id),
          tx.capitalAccount
            .findUnique({ where: { name: 'INVENTORY' } })
            .then((a) => a?.id),
        ]);

        if (!cashId || !inventoryId) {
          throw new Error(
            'No se encontraron las cuentas contables requeridas (CASH o INVENTORY)',
          );
        }

        // transferir de cash a inveratio
        await tx.capitalTransaction.create({
          data: {
            amount: item.unitCost,
            type: 'TRANSFER_OUT',
            referenceType: 'PURCHASE',
            referenceId: purchase.id,
            description: `Compra de producto único (${prodItem.serialCode})`,
            originAccountId: cashId,
            accountId: inventoryId,
          },
        });
      }

      return created(purchase, 'Compra creada correctamente');
    });
  }

  async confirmProductItemArrival(itemId: number) {
    const item = await this.prisma.productItem.findUnique({
      where: { id: itemId },
    });

    if (!item) throw new NotFoundException('Producto no encontrado');

    if (item.status !== 'ORDERED') {
      throw new BadRequestException(
        'Solo se pueden confirmar productos en estado "ORDERED"',
      );
    }
    return this.prisma.productItem.update({
      where: { id: itemId },
      data: {
        status: 'IN_STOCK',
      },
    });
  }

  async getAccountIdByName(name: CapitalAccountName): Promise<number> {
    const account = await this.prisma.capitalAccount.findUnique({
      where: { name },
    });
    if (!account) {
      throw new Error(`Cuenta de capital '${name}' no existe`);
    }
    return account.id;
  }
}
