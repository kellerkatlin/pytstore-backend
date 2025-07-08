import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async getTotalStock(productId: number): Promise<number> {
    const [productExists, variantStockSum, productItemCount] =
      await Promise.all([
        this.prisma.product.findUnique({
          where: { id: productId },
          select: { id: true },
        }),
        this.prisma.productVariant.aggregate({
          _sum: { stock: true },
          where: { productId },
        }),
        this.prisma.productItem.count({
          where: {
            productId,
            status: 'IN_STOCK',
          },
        }),
      ]);

    if (!productExists) return 0;

    const variantStock = variantStockSum._sum.stock ?? 0;

    return variantStock + productItemCount;
  }
}
