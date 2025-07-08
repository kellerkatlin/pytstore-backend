import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FilterCommissionDto } from './dto/filter-commission.dto';
import { ok } from 'src/common/helpers/response.helper';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: number, filter: FilterCommissionDto) {
    return this.prisma.commission.findMany({
      where: {
        userId,
        status: filter.status,
      },
      include: {
        sale: {
          select: {
            id: true,
            createdAt: true,
            totalAmount: true,
            profitTotal: true,
            saleItems: {
              select: {
                product: { select: { title: true } },
                variant: {
                  select: { sku: true },
                },
                quantity: true,
                unitPrice: true,
              },
            },
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
    const [pendingCommissions, paidCommissions, pendingWithdrawals] =
      await this.prisma.$transaction([
        this.prisma.commission.aggregate({
          _sum: { amount: true },
          where: { userId, status: 'PENDING' },
        }),
        this.prisma.commission.aggregate({
          _sum: { amount: true },
          where: { userId, status: 'PAID' },
        }),
        this.prisma.withdrawalRequest.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            status: 'PENDING', // aún no aprobado
          },
        }),
      ]);

    const totalPendingCommissions = pendingCommissions._sum.amount ?? 0;
    const totalPaid = paidCommissions._sum.amount ?? 0;
    const totalWithdrawRequested = pendingWithdrawals._sum.amount ?? 0;

    const totalEarned = totalPendingCommissions + totalPaid;
    const availableToWithdraw =
      totalPendingCommissions - totalWithdrawRequested;

    return ok(
      {
        totalEarned,
        totalPaid,
        totalPending: totalPendingCommissions,
        pendingWithdrawals: totalWithdrawRequested,
        availableToWithdraw,
        canWithdraw: availableToWithdraw > 0,
      },
      'Resumen de comisiones actualizado correctamente',
    );
  }
}
