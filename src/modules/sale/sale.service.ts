import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { created } from 'src/common/helpers/response.helper';
import {
  InventoryMovementDirection,
  InventoryMovementSourceType,
  Prisma,
  SalesStatus,
} from '@prisma/client';

@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}

  private async registerCommission(
    tx: Prisma.TransactionClient,
    sale: { id: number; totalAmount: number; profitTotal: number },
    product: { commissionType: 'FIXED' | 'PERCENT'; commissionValue: number },
    sellerUserId: number,
    basedOnProfit = false,
  ) {
    const base = basedOnProfit ? sale.profitTotal : sale.totalAmount;

    const amount =
      product.commissionType === 'PERCENT'
        ? (product.commissionValue / 100) * base
        : product.commissionValue;

    return tx.commission.create({
      data: {
        saleId: sale.id,
        userId: sellerUserId,
        amount,
        status: 'PENDING',
      },
    });
  }

  async create(dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) throw new NotFoundException('Producto no encontrado');

      const customer = await tx.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) throw new NotFoundException('Cliente no encontrado');

      const user = await tx.user.findUnique({
        where: { id: dto.userId },
      });
      if (!user) throw new NotFoundException('Vendedor no encontrado');

      let costUnit = 0;
      let purchaseItemId: number | null = null;

      // 🔹 PRODUCTO ÚNICO
      if (dto.productItemId) {
        if (dto.quantity !== 1) {
          throw new BadRequestException(
            'Solo se puede vender 1 unidad de un producto único',
          );
        }

        const item: Prisma.ProductItemGetPayload<{
          include: { purchaseItem: true };
        }> | null = await tx.productItem.findUnique({
          where: { id: dto.productItemId },
          include: { purchaseItem: true },
        });

        if (!item) {
          throw new NotFoundException('Producto único no encontrado');
        }

        if (!item.available || item.sold) {
          throw new BadRequestException(
            'Producto único no disponible para venta',
          );
        }

        costUnit = item.cost;
        purchaseItemId = item.purchaseItem?.id ?? null;

        await tx.productItem.update({
          where: { id: dto.productItemId },
          data: { available: false, sold: true },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: dto.productId,
            sourceType: InventoryMovementSourceType.SALE,
            sourceId: dto.productItemId,
            quantity: 1,
            direction: InventoryMovementDirection.OUT,
            reason: 'Venta de producto único',
          },
        });
      }

      // 🔹 PRODUCTO CON VARIANTE
      else if (dto.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: dto.variantId },
        });

        if (!variant || variant.stock < dto.quantity) {
          throw new BadRequestException('Stock insuficiente en variante');
        }

        costUnit = dto.salePrice * 0.6; // ⚠️ Sustituir con lógica real de costos
        await tx.productVariant.update({
          where: { id: dto.variantId },
          data: {
            stock: { decrement: dto.quantity },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: dto.productId,
            variantId: dto.variantId,
            sourceType: InventoryMovementSourceType.SALE,
            sourceId: 0,
            quantity: dto.quantity,
            direction: InventoryMovementDirection.OUT,
            reason: 'Venta de producto con variante',
          },
        });
      }

      // 🔹 PRODUCTO MASIVO
      else {
        if (product.stock < dto.quantity) {
          throw new BadRequestException(
            'Stock insuficiente para producto masivo',
          );
        }

        costUnit = dto.salePrice * 0.5; // ⚠️ Sustituir con lógica real de costos
        await tx.product.update({
          where: { id: dto.productId },
          data: {
            stock: { decrement: dto.quantity },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: dto.productId,
            sourceType: InventoryMovementSourceType.SALE,
            sourceId: 0,
            quantity: dto.quantity,
            direction: InventoryMovementDirection.OUT,
            reason: 'Venta de producto masivo',
          },
        });
      }

      const total = dto.salePrice * dto.quantity;
      const cost = costUnit * dto.quantity;
      const profit = total - cost;

      let sellerUserId = dto.userId;

      if (!sellerUserId) {
        const fallbackReferralCode =
          dto.referralCode ?? 'MI-CODIGO-POR-DEFECTO'; // reemplaza con el tuyo

        const refUser = await tx.user.findUnique({
          where: { referralCode: fallbackReferralCode },
        });

        if (!refUser) {
          throw new NotFoundException(
            'No se encontró un vendedor con el código de referido',
          );
        }

        sellerUserId = refUser.id;
      }

      const sale = await tx.sale.create({
        data: {
          productId: dto.productId,
          variantId: dto.variantId,
          productItemId: dto.productItemId,
          purchaseItemId,
          quantity: dto.quantity,
          salePrice: dto.salePrice,
          totalAmount: total,
          costTotal: cost,
          profitTotal: profit,
          userId: dto.userId,
          customerId: dto.customerId,
          type: dto.type ?? 'REGULAR',
          notes: dto.notes,
          status: SalesStatus.PAID,
          isEmailVerified: false,
          isPhoneVerified: false,
          commissionBasedOnProfit: false,
        },
      });

      await this.registerCommission(
        tx,
        sale,
        product,
        sellerUserId,
        sale.commissionBasedOnProfit,
      );

      return created(sale, 'Venta registrada correctamente');
    });
  }
}
