import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { ok, paginated } from 'src/common/helpers/response.helper';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';
import { CapitalService } from '../capital/capital.service';
import {
  CapitalAccountName,
  CapitalSourceType,
  CapitalType,
  Prisma,
  WithdrawalStatus,
} from '@prisma/client';

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly capitalService: CapitalService,
  ) {}

  async requestWithdrawal(userId: number, dto: CreateWithdrawalRequestDto) {
    const [pendingCommission, pendingWithdrawals] =
      await this.prisma.$transaction([
        this.prisma.commission.aggregate({
          _sum: { amount: true },
          where: { userId, status: 'PENDING' },
        }),
        this.prisma.withdrawalRequest.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            status: 'PENDING', // solicitudes aún no aprobadas
          },
        }),
      ]);

    const totalCommissions = pendingCommission._sum.amount ?? 0;
    const totalRequested = pendingWithdrawals._sum.amount ?? 0;
    const available = totalCommissions - totalRequested;

    if (dto.amount > available) {
      throw new BadRequestException(
        `No tienes suficientes comisiones disponibles. Monto disponible: S/ ${available.toFixed(2)}.`,
      );
    }

    const withdrawal = await this.prisma.withdrawalRequest.create({
      data: {
        userId,
        amount: dto.amount,
        status: 'PENDING',
      },
    });

    return ok(withdrawal, 'Solicitud de retiro creada correctamente');
  }

  async getMyWithdrawals(
    userId: number,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const dateFilter: Prisma.WithdrawalRequestWhereInput = {};

    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      dateFilter.createdAt = { gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.createdAt = { lte: new Date(endDate) };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.withdrawalRequest.findMany({
        where: {
          userId,
          ...dateFilter,
        },
        skip,
        take: +limit,
        orderBy: [
          {
            status: 'asc', // ✅ PENDING al inicio (alfabéticamente)
          },
          {
            createdAt: 'desc', // dentro de cada grupo, ordenar por fecha
          },
        ],
      }),
      this.prisma.withdrawalRequest.count({
        where: {
          userId,
          ...dateFilter,
        },
      }),
    ]);

    return paginated(
      data,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Historial de solicitudes de retiro',
    );
  }

  async updateStatus(id: number, dto: UpdateWithdrawalStatusDto) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
    });

    if (!request) throw new NotFoundException('Solicitud no encontrada');

    if (request.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException(
        'Solo se pueden actualizar solicitudes pendientes',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const result = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: dto.status,
          updatedAt: new Date(),
        },
      });

      if (dto.status === WithdrawalStatus.APPROVED) {
        const commissionId = await this.capitalService.getAccountIdByName(
          CapitalAccountName.COMMISSIONS,
        );
        const disponible =
          await this.capitalService.getAvailableCapitalByAccountId(
            commissionId,
          );
        if (request.amount > disponible) {
          throw new BadRequestException(
            'No hay suficiente capital disponible en caja',
          );
        }

        await tx.capitalTransaction.create({
          data: {
            amount: request.amount,
            type: CapitalType.WITHDRAWAL,
            referenceType: CapitalSourceType.WITHDRAWAL,
            referenceId: request.id,
            description: `Retiro aprobado para usuario ${request.userId}`,
            originAccountId: commissionId,
          },
        });

        // Marcar solo las comisiones necesarias como pagadas
        let remaining = request.amount;

        const commissions = await tx.commission.findMany({
          where: {
            userId: request.userId,
            status: { in: ['PENDING', 'PARTIALLY_PAID'] },
          },
          orderBy: { createdAt: 'asc' },
        });

        for (const commission of commissions) {
          if (remaining <= 0) break;

          const unpaid = commission.amount - commission.paidAmount;
          const toPay = Math.min(remaining, unpaid);

          await tx.commission.update({
            where: { id: commission.id },
            data: {
              paidAmount: { increment: toPay },
              status:
                toPay + commission.paidAmount >= commission.amount
                  ? 'PAID'
                  : 'PARTIALLY_PAID',
            },
          });

          remaining -= toPay;
        }
      }

      return ok(
        result,
        `Solicitud de retiro ${dto.status.toLowerCase()} correctamente`,
      );
    });
  }

  async getAllForAdmin(
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const dateFilter: Prisma.WithdrawalRequestWhereInput = {};

    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      dateFilter.createdAt = { gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.createdAt = { lte: new Date(endDate) };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.withdrawalRequest.findMany({
        where: {
          ...dateFilter,
        },
        skip,
        take: +limit,
        orderBy: [
          {
            status: 'asc', // ✅ PENDING al inicio (alfabéticamente)
          },
          {
            createdAt: 'desc', // dentro de cada grupo, ordenar por fecha
          },
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.withdrawalRequest.count({
        where: {
          ...dateFilter,
        },
      }),
    ]);

    return paginated(
      data,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Historial de solicitudes de retiro',
    );
  }
}
