import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePurchaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          providerName: dto.providerName,
          invoiceCode: dto.invoiceCode,
          purchaseDate: new Date(dto.purchaseDate),
        },
      });

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) throw new NotFoundException('Producto no encontrado');

        const purchaseItem = await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: item.productId,
            unitCost: item.unitCost,
            quantity: item.quantity,
            status: 'RECEIVED',
          },
        });

        // 🔹 Caso 1: Productos únicos (serializados)
        if (item.items?.length) {
          if (item.items.length !== item.quantity) {
            throw new Error(
              `Cantidad de items únicos (${item.items.length}) no coincide con quantity (${item.quantity}) para el producto ${item.productId}`,
            );
          }

          for (const single of item.items) {
            await tx.productItem.create({
              data: {
                productId: item.productId,
                purchaseItemId: purchaseItem.id,
                serialCode: single.serialCode,
                condition: single.condition,
                functionality: single.functionality,
                cost: single.cost,
                salePrice: single.salePrice,
                available: true,
                sold: false,
              },
            });

            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                sourceType: 'PURCHASE',
                sourceId: purchaseItem.id,
                quantity: 1,
                direction: 'IN',
                reason: `Ingreso de item único por compra ${dto.invoiceCode}`,
              },
            });
          }

          continue; // no actualizar stock general
        }

        // 🔹 Caso 2: Productos con variantes
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              sourceType: 'PURCHASE',
              sourceId: purchaseItem.id,
              quantity: item.quantity,
              direction: 'IN',
              reason: `Ingreso de variante por compra ${dto.invoiceCode}`,
            },
          });

          continue;
        }

        // 🔹 Caso 3: Productos masivos
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            sourceType: 'PURCHASE',
            sourceId: purchaseItem.id,
            quantity: item.quantity,
            direction: 'IN',
            reason: `Ingreso por compra ${dto.invoiceCode}`,
          },
        });
      }

      return purchase;
    });
  }
}
