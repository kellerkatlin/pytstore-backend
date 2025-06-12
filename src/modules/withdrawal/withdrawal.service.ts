import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { ok } from 'src/common/helpers/response.helper';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';
import { CapitalService } from '../capital/capital.service';
import {
  CapitalAccountName,
  CapitalSourceType,
  CapitalType,
  CommissionStatus,
  WithdrawalStatus,
} from '@prisma/client';

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly capitalService: CapitalService,
  ) {}

  async requestWithdrawal(userId: number, dto: CreateWithdrawalRequestDto) {
    const totalPending = await this.prisma.commission.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        status: 'PENDING',
      },
    });

    const available = totalPending._sum.amount ?? 0;
    if (dto.amount > available) {
      throw new BadRequestException(
        'No tienes suficientes comisiones disponibles para retirar',
      );
    }

    const withdrawal = await this.prisma.withdrawalRequest.create({
      data: {
        userId,
        amount: dto.amount,
        status: 'PENDING',
      },
    });

    // ⚠️ Si deseas congelar comisiones, se podría marcar alguna lógica adicional

    return ok(withdrawal, 'Solicitud de retiro creada correctamente');
  }

  async getMyWithdrawals(userId: number) {
    const withdrawals = await this.prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return ok(withdrawals, 'Historial de solicitudes de retiro');
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
        const cajaId = await this.capitalService.getAccountIdByName(
          CapitalAccountName.CASH,
        );
        const disponible =
          await this.capitalService.getAvailableCapitalByAccountId(cajaId);

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
            accountId: cajaId,
          },
        });

        // Marcar solo las comisiones necesarias como pagadas
        const commissions = await tx.commission.findMany({
          where: {
            userId: request.userId,
            status: CommissionStatus.PENDING,
          },
          orderBy: { createdAt: 'asc' },
        });

        let remaining = request.amount;
        for (const com of commissions) {
          if (remaining <= 0) break;

          await tx.commission.update({
            where: { id: com.id },
            data: { status: CommissionStatus.PAID },
          });

          remaining -= com.amount;
        }
      }

      return ok(
        result,
        `Solicitud de retiro ${dto.status.toLowerCase()} correctamente`,
      );
    });
  }

  async getAllForAdmin() {
    const withdrawals = await this.prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    return ok(withdrawals, 'Historial de solicitudes de retiro');
  }
}
