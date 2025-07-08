import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { created, ok, paginated } from 'src/common/helpers/response.helper';
import { CommissionType, Prisma } from '@prisma/client';
import { JwtPayload } from '../auth/dto/jwt-payload.dto';
import { FilterSaleDto } from './dto/filter-sale.dto';
import { SearchSaleItemsDto } from './dto/search-sale-items.dto';
import { PaySaleDto } from './dto/pay-sale.dto';
import { ApproveSaleDto } from './dto/approve-sale.dto';

@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}

  private extractIgv(priceWithIgv: number, isGravado: boolean, igvRate = 0.18) {
    if (!isGravado) return { base: priceWithIgv, igv: 0 };
    const base = priceWithIgv / (1 + igvRate);
    const igv = priceWithIgv - base;
    return { base, igv };
  }

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

  private resolveCommissionSource(
    product: { commissionType: CommissionType; commissionValue: number },
    variant?: {
      commissionType: CommissionType | null;
      commissionValue: number | null;
    } | null,
    item?: {
      commissionType: CommissionType | null;
      commissionValue: number | null;
    } | null,
  ): { commissionType: CommissionType; commissionValue: number } {
    if (item?.commissionType && item.commissionValue != null) {
      return {
        commissionType: item.commissionType,
        commissionValue: item.commissionValue,
      };
    }
    if (variant?.commissionType && variant.commissionValue != null) {
      return {
        commissionType: variant.commissionType,
        commissionValue: variant.commissionValue,
      };
    }
    return {
      commissionType: product.commissionType,
      commissionValue: product.commissionValue,
    };
  }

  // calculo de gasto total de iems
  private async getProductItemTotalCost(
    itemId: number,
    tx: Prisma.TransactionClient,
  ) {
    const item = await tx.productItem.findUnique({
      where: { id: itemId },
      include: { purchaseItem: true },
    });

    const extraCosts = await tx.productCostDetail.findMany({
      where: { productItemId: itemId },
    });

    const unitCost = item?.purchaseItem?.unitCost ?? 0;
    const extras = extraCosts.reduce((sum, c) => sum + c.amount, 0);
    return +(unitCost + extras);
  }

  async findAll(user: JwtPayload, query: FilterSaleDto) {
    const { page = 1, limit = 10, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = {
      ...(user.role === 'SELLER' && { userId: user.sub }),
      ...(status && { status }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        skip,
        take: +limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          saleItems: true,
          user: { select: { name: true } },
          commission: true,
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return paginated(
      data,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Ventas encontradas',
    );
  }

  async findById(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        saleItems: true,
        user: true,
        commission: true,
      },
    });

    if (!sale) throw new NotFoundException('Venta no encontrada');

    return ok(sale, 'Detalle de venta cargado');
  }

  async create(dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const [customer, user] = await Promise.all([
        tx.customer.findUnique({ where: { id: dto.customerId } }),
        tx.user.findUnique({ where: { id: dto.userId } }),
      ]);

      if (!customer) throw new NotFoundException('Cliente no encontrado');
      if (!user) throw new NotFoundException('Vendedor no encontrado');

      const sale = await tx.sale.create({
        data: {
          customerId: dto.customerId,
          userId: dto.userId,
          notes: dto.notes,
          type: dto.type ?? 'REGULAR',
          status: 'PENDING',
          isEmailVerified: false,
          isPhoneVerified: false,
          commissionBasedOnProfit: false,
          totalAmount: 0,
          costTotal: 0,
          profitTotal: 0,
          igvAmount: 0,
          subtotal: 0,
          salePrice: 0,
        },
      });

      let subtotal = 0;
      let igvAmount = 0;
      let totalAmount = 0;
      let costTotal = 0;
      let profitTotal = 0;

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new NotFoundException('Producto no encontrado');

        let costUnit = 0;
        let purchaseItemId: number | null = null;
        let taxType = product.taxType;

        if (item.productItemId) {
          const productItem = await tx.productItem.findUnique({
            where: { id: item.productItemId },
            include: { purchaseItem: true },
          });
          if (!productItem)
            throw new NotFoundException('Producto único no encontrado');
          if (productItem.status !== 'IN_STOCK') {
            throw new BadRequestException('Producto único no disponible');
          }
          if (!productItem.purchaseItem)
            throw new NotFoundException(
              'Producto único sin información de compra',
            );

          costUnit = productItem.purchaseItem.unitCost;
          purchaseItemId = productItem.purchaseItem.id;
          taxType = productItem.taxType ?? product.taxType;

          await tx.productItem.update({
            where: { id: item.productItemId },
            data: { status: 'SOLD' },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              sourceType: 'SALE',
              sourceId: item.productItemId,
              quantity: 1,
              direction: 'OUT',
              reason: 'Venta de producto único',
            },
          });
        } else if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (!variant || variant.stock < item.quantity) {
            throw new BadRequestException('Stock insuficiente en la variante');
          }

          taxType = variant.taxType ?? product.taxType;

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              sourceType: 'SALE',
              sourceId: 0,
              quantity: item.quantity,
              direction: 'OUT',
              reason: 'Venta de producto con variante',
            },
          });
        }

        const total = item.salePrice * item.quantity;
        const isGravado = taxType === 'GRAVADO';
        const { base, igv } = this.extractIgv(total, isGravado);

        subtotal += base;
        igvAmount += igv;
        totalAmount += total;

        const cost = costUnit * item.quantity;
        const profit = total - cost;

        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            variantId: item.variantId,
            productItemId: item.productItemId,
            purchaseItemId,
            quantity: item.quantity,
            unitPrice: item.salePrice,
            totalPrice: total,
            costUnit,
            costTotal: cost,
            profitTotal: profit,
          },
        });

        costTotal += cost;
        profitTotal += profit;
      }

      await tx.sale.update({
        where: { id: sale.id },
        data: {
          totalAmount,
          costTotal,
          profitTotal,
          salePrice: totalAmount,
          subtotal,
          igvAmount,
        },
      });

      return created({ id: sale.id }, 'Venta registrada correctamente');
    });
  }

  // pagar venta
  async paySale(saleId: number, dto: PaySaleDto, user: JwtPayload) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { payments: true },
      });

      if (!sale) throw new NotFoundException('Venta no encontrada');
      if (sale.status !== 'PENDING') {
        throw new BadRequestException('Solo se pueden pagar ventas pendientes');
      }

      if (user.role === 'SELLER' && sale.userId !== user.sub) {
        throw new ForbiddenException(
          'No puedes pagar una venta de otro vendedor',
        );
      }

      // Registrar el pago
      await tx.payment.create({
        data: {
          saleId: sale.id,
          paymentMethodId: dto.paymentMethodId,
          totalPaid: sale.totalAmount,
          paidAt: new Date(),
          documentUrl: dto.documentUrl,
          status: 'COMPLETED',
        },
      });

      // Cambiar estado de la venta
      await tx.sale.update({
        where: { id: sale.id },
        data: { status: 'PAID' },
      });

      return ok('Venta marcada como pagada');
    });
  }

  async approveSale(saleId: number, dto: ApproveSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } });

      if (!sale) throw new NotFoundException('Venta no encontrada');

      if (sale.status !== 'PAID') {
        throw new BadRequestException('Solo se pueden aprobar ventas pagadas');
      }

      // Registrar gastos adicionales (documentos, validaciones)
      if (dto.additionalCosts?.length) {
        for (const cost of dto.additionalCosts) {
          await tx.productCostDetail.create({
            data: {
              saleId,
              origin: 'SALE',
              type: cost.type,
              amount: cost.amount,
              description: cost.description,
              documentUrl: cost.documentUrl ?? undefined,
            },
          });
        }
      }

      // Actualizar estado (nada más)
      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'APPROVED' },
      });

      return ok('Venta aprobada correctamente');
    });
  }

  async prepareSale(saleId: number) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } });

      if (!sale) throw new NotFoundException('Venta no encontrada');

      if (sale.status !== 'APPROVED') {
        throw new BadRequestException(
          'Solo se pueden preparar ventas aprobadas',
        );
      }

      await tx.sale.update({
        where: { id: saleId },
        data: {
          status: 'IN_PROCESS',
        },
      });

      return ok('Venta marcada como en preparación');
    });
  }

  async completeSale(saleId: number) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          saleItems: {
            include: {
              product: true,
              variant: true,
              productItem: true,
            },
          },
        },
      });

      if (!sale) throw new NotFoundException('Venta no encontrada');

      if (sale.status !== 'IN_PROCESS') {
        throw new BadRequestException(
          'Solo se pueden completar ventas en proceso',
        );
      }

      // Cargar cuentas
      const [cashId, inventoryId, commissionAccountId] = await Promise.all([
        tx.capitalAccount
          .findUnique({ where: { name: 'CASH' } })
          .then((a) => a?.id),
        tx.capitalAccount
          .findUnique({ where: { name: 'INVENTORY' } })
          .then((a) => a?.id),
        tx.capitalAccount
          .findUnique({ where: { name: 'COMMISSIONS' } })
          .then((a) => a?.id),
      ]);

      if (!inventoryId) throw new Error('No existe la cuenta de Inventario');
      if (!commissionAccountId)
        throw new Error('No existe la cuenta de Comision');
      if (!cashId) throw new Error('No existe la cuenta de Caja');

      // Obtener costos adicionales
      const extraCosts = await tx.productCostDetail.findMany({
        where: { origin: 'SALE', saleId },
      });

      const totalExtraCost = extraCosts.reduce(
        (sum, cost) => sum + cost.amount,
        0,
      );
      const adjustedCostTotal = sale.costTotal + totalExtraCost;
      let totalCommission = 0;

      for (const item of sale.saleItems) {
        const commissionSource = this.resolveCommissionSource(
          item.product,
          item.variant,
          item.productItem,
        );

        const total = item.totalPrice;
        const isGravado =
          item.productItem?.taxType === 'GRAVADO' ||
          item.variant?.taxType === 'GRAVADO' ||
          item.product.taxType === 'GRAVADO';

        const { base: baseWithoutIgv } = this.extractIgv(total, isGravado);

        let realCost = item.costTotal;
        if (item.productItemId) {
          realCost = await this.getProductItemTotalCost(item.productItemId, tx);
        }

        const proportion = item.totalPrice / sale.totalAmount;
        const extraShare = totalExtraCost * proportion;

        const adjustedCost = realCost + extraShare;
        const netProfit = baseWithoutIgv - adjustedCost;

        const unitCommission =
          commissionSource.commissionType === 'PERCENT'
            ? (netProfit * commissionSource.commissionValue) / 100
            : commissionSource.commissionValue;

        totalCommission += unitCommission;

        await tx.saleItem.update({
          where: { id: item.id },
          data: {
            costUnit: adjustedCost,
            costTotal: adjustedCost,
            profitTotal: netProfit,
          },
        });
      }

      // Actualizar inventario
      for (const item of sale.saleItems) {
        if (item.productItemId) {
          await tx.productItem.update({
            where: { id: item.productItemId },
            data: { isDeleted: true, status: 'SOLD' },
          });
        } else if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Transacciones contables
      await tx.capitalTransaction.create({
        data: {
          amount: sale.totalAmount,
          type: 'SALE_PROFIT',
          referenceType: 'SALE',
          referenceId: sale.id,
          description: `Venta #${sale.id} - Ingreso de venta`,
          accountId: cashId,
        },
      });

      await tx.capitalTransaction.create({
        data: {
          amount: adjustedCostTotal,
          type: 'TRANSFER_OUT',
          referenceType: 'SALE',
          referenceId: sale.id,
          description: `Venta #${sale.id} - Costo total`,
          originAccountId: inventoryId,
          accountId: cashId,
        },
      });

      await tx.capitalTransaction.create({
        data: {
          amount: totalCommission,
          type: 'TRANSFER_OUT',
          referenceType: 'SALE',
          referenceId: sale.id,
          description: `Venta #${sale.id} - Comisión`,
          originAccountId: cashId,
          accountId: commissionAccountId,
        },
      });

      await tx.commission.create({
        data: {
          saleId: sale.id,
          userId: sale.userId,
          amount: totalCommission,
          status: 'PENDING',
        },
      });

      // Actualizar estado
      await tx.sale.update({
        where: { id: saleId },
        data: {
          status: 'COMPLETED',
          costTotal: adjustedCostTotal,
        },
      });

      return ok('Venta completada correctamente');
    });
  }

  async rejectSale(saleId: number) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          saleItems: true, // trae los items para revertir stock
        },
      });

      if (!sale) throw new NotFoundException('Venta no encontrada');
      if (sale.status !== 'PENDING') {
        throw new BadRequestException(
          'Solo se pueden rechazar ventas pendientes',
        );
      }

      // Revertir inventario por cada item
      for (const item of sale.saleItems) {
        if (item.productItemId) {
          await tx.productItem.update({
            where: { id: item.productItemId },
            data: { status: 'IN_STOCK' },
          });
        } else if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Marcar venta como cancelada
      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'CANCELED' },
      });

      return ok('Venta rechazada y stock revertido');
    });
  }
  async searchItems(params: SearchSaleItemsDto) {
    const { search = '', page = 1, limit = 10 } = params;

    const isNumeric = !isNaN(Number(search));
    const searchNumber = Number(search);
    const skip = (page - 1) * limit;
    const fetchLimit = limit * 2; // margen para luego filtrar y cortar

    const [uniqueItems, uniqueTotal] = await this.prisma.$transaction([
      this.prisma.productItem.findMany({
        where: {
          status: 'IN_STOCK',
          isDeleted: false,
          product: { isActive: true, status: 'ACTIVE' },
          OR: [
            { serialCode: { contains: search, mode: 'insensitive' } },
            { product: { title: { contains: search, mode: 'insensitive' } } },
            {
              attributes: {
                some: {
                  value: { value: { contains: search, mode: 'insensitive' } },
                },
              },
            },
            ...(isNumeric ? [{ salePrice: searchNumber }] : []),
          ],
        },
        include: {
          product: true,
          attributes: {
            include: {
              attribute: true,
              value: true,
            },
          },
          images: { where: { isPrimary: true }, take: 1 },
        },
        take: fetchLimit,
      }),
      this.prisma.productItem.count({
        where: {
          status: 'IN_STOCK',
          isDeleted: false,
          product: { isActive: true, status: 'ACTIVE' },
          OR: [
            { serialCode: { contains: search, mode: 'insensitive' } },
            { product: { title: { contains: search, mode: 'insensitive' } } },
            {
              attributes: {
                some: {
                  value: { value: { contains: search, mode: 'insensitive' } },
                },
              },
            },
            ...(isNumeric ? [{ salePrice: searchNumber }] : []),
          ],
        },
      }),
    ]);

    const [variantItems, variantTotal] = await this.prisma.$transaction([
      this.prisma.productVariant.findMany({
        where: {
          status: 'ACTIVE',
          stock: { gt: 0 },
          product: { isActive: true, status: 'ACTIVE' },
          OR: [
            { sku: { contains: search, mode: 'insensitive' } },
            { product: { title: { contains: search, mode: 'insensitive' } } },
            {
              attributes: {
                some: {
                  value: { value: { contains: search, mode: 'insensitive' } },
                },
              },
            },
            ...(isNumeric ? [{ price: searchNumber }] : []),
          ],
        },
        include: {
          product: true,
          attributes: {
            include: {
              attribute: true,
              value: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        take: fetchLimit,
      }),
      this.prisma.productVariant.count({
        where: {
          status: 'ACTIVE',
          stock: { gt: 0 },
          product: {
            isActive: true,
            status: 'ACTIVE',
          },
          OR: [
            { sku: { contains: search, mode: 'insensitive' } },
            { product: { title: { contains: search, mode: 'insensitive' } } },
            {
              attributes: {
                some: {
                  value: { value: { contains: search, mode: 'insensitive' } },
                },
              },
            },
            ...(isNumeric ? [{ price: searchNumber }] : []),
          ],
        },
      }),
    ]);

    const allItems = [
      ...uniqueItems.map((item) => ({
        id: item.id,
        type: 'UNIQUE',
        productId: item.productId,
        productItemId: item.id,
        name: item.product.title,
        imageUrl: item.images[0]?.imageUrl ?? null,
        serialCode: item.serialCode,
        salePrice: item.salePrice,
        stock: 1,
        attributes: item.attributes.map((a) => ({
          name: a.attribute.name,
          value: a.value.value,
        })),
      })),
      ...variantItems.map((variant) => ({
        id: variant.id,
        type: 'VARIANT',
        productId: variant.productId,
        variantId: variant.id,
        sku: variant.sku,
        imageUrl: variant.images[0]?.imageUrl ?? null,
        name: variant.product.title,
        salePrice: variant.price,
        stock: variant.stock,
        attributes: variant.attributes.map((a) => ({
          name: a.attribute.name,
          value: a.value.value,
        })),
      })),
    ];

    // aplicar paginación combinada
    const paginatedItems = allItems
      .sort((a, b) => a.name.localeCompare(b.name)) // puedes cambiar por createdAt u otro criterio
      .slice(skip, skip + limit);

    return paginated(
      paginatedItems,
      {
        total: uniqueTotal + variantTotal,
        page: +page,
        lastPage: Math.ceil((uniqueTotal + variantTotal) / limit),
      },
      'Productos listados correctamente',
    );
  }
}
