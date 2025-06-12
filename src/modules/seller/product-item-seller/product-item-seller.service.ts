import { Injectable } from '@nestjs/common';
import { paginated } from 'src/common/helpers/response.helper';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FilterUniqueProductDto } from './dto/filter-unique-product.dto';

@Injectable()
export class ProductItemSellerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FilterUniqueProductDto) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
      condition,
      functionality,
    } = query;

    const skip = (page - 1) * limit;

    const isNumeric = !isNaN(Number(search));
    const searchNumber = Number(search);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.productItem.findMany({
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order },
        where: {
          available: true,
          sold: false,
          condition: condition
            ? { contains: condition, mode: 'insensitive' }
            : undefined,
          functionality: functionality
            ? { contains: functionality, mode: 'insensitive' }
            : undefined,
          AND: [
            {
              product: {
                isActive: true,
                status: 'ACTIVE',
              },
            },
            {
              OR: [
                {
                  product: { title: { contains: search, mode: 'insensitive' } },
                },
                {
                  product: {
                    brand: { name: { contains: search, mode: 'insensitive' } },
                  },
                },
                ...(isNumeric ? [{ salePrice: searchNumber }] : []),
              ],
            },
          ],
        },
        include: {
          product: {
            include: {
              brand: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      }),

      this.prisma.productItem.count({
        where: {
          available: true,
          sold: false,
          condition: condition
            ? { contains: condition, mode: 'insensitive' }
            : undefined,
          functionality: functionality
            ? { contains: functionality, mode: 'insensitive' }
            : undefined,
          AND: [
            {
              product: {
                isActive: true,
                status: 'ACTIVE',
              },
            },
            {
              OR: [
                {
                  product: { title: { contains: search, mode: 'insensitive' } },
                },
                {
                  product: {
                    brand: { name: { contains: search, mode: 'insensitive' } },
                  },
                },
                ...(isNumeric ? [{ salePrice: searchNumber }] : []),
              ],
            },
          ],
        },
      }),
    ]);

    const mappedData = data.map((item) => {
      const commissionValue =
        item.commissionValue ?? item.product.commissionValue;
      const commissionType = item.commissionType ?? item.product.commissionType;

      let profit = 0;

      // Solo permitimos calcular sobre utilidad
      const utilidad = item.salePrice - item.cost;

      if (commissionType === 'PERCENT') {
        profit = (utilidad * commissionValue) / 100;
      } else if (commissionType === 'FIXED') {
        profit = commissionValue;
      }

      return {
        id: item.id,
        productId: item.productId,
        productTitle: item.product.title,
        brandName: item.product.brand.name,
        serialCode: item.serialCode,
        condition: item.condition,
        functionality: item.functionality,
        salePrice: item.salePrice,
        profit: profit,
        sold: item.sold,
        available: item.available,
        createdAt: item.createdAt,
        imagenUrl: item.images[0]?.imageUrl ?? null,
      };
    });

    return paginated(
      mappedData,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Listado de productos únicos disponibles',
    );
  }
}
