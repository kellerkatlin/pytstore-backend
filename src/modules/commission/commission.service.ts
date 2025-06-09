import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FilterCommissionDto } from './dto/filter-commission.dto';
import { ok } from 'src/common/helpers/response.helper';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: number, filter: FilterCommissionDto) {
    return this.prisma.commission.findMany({
      where: {
        userId,
        status: filter.status,
      },
      include: {
        sale: {
          select: {
            id: true,
            product: { select: { title: true } },
            totalAmount: true,
            profitTotal: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTotalEarnings(userId: number) {
    const result = await this.prisma.commission.aggregate({
      _sum: { amount: true },
      where: { userId, status: 'PAID' },
    });

    return result._sum.amount ?? 0;
  }

  async getSummary(userId: number) {
    const [pending, paid] = await this.prisma.$transaction([
      this.prisma.commission.aggregate({
        _sum: { amount: true },
        where: { userId, status: 'PENDING' },
      }),
      this.prisma.commission.aggregate({
        _sum: { amount: true },
        where: { userId, status: 'PAID' },
      }),
    ]);

    const totalPending = pending._sum.amount ?? 0;
    const totalPaid = paid._sum.amount ?? 0;
    const totalEarned = totalPending + totalPaid;

    return ok(
      {
        totalEarned,
        totalPending,
        totalPaid,
        canWithdraw: totalPending > 0,
      },
      'Resumen de comisiones obtenido correctamente',
    );
  }
}
