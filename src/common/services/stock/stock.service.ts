import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async getTotalStock(productId: number): Promise<number> {
    const [product, variantStockSum, productItemCount] = await Promise.all([
      this.prisma.product.findUnique({
        where: { id: productId },
        select: {
          stock: true,
          variants: true,
          items: true,
        },
      }),
      this.prisma.productVariant.aggregate({
        _sum: { stock: true },
        where: { productId },
      }),
      this.prisma.productItem.count({
        where: {
          productId,
          available: true,
          sold: false,
        },
      }),
    ]);
    if (!product) return 0;

    const hasVariants = product.variants.length > 0;
    const hasProductItems = product.items.length > 0;

    if (hasVariants || hasProductItems) {
      return (variantStockSum._sum.stock ?? 0) + productItemCount;
    }
    return product.stock;
  }
}
