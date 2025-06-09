import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { ok } from 'src/common/helpers/response.helper';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';

@Injectable()
export class WithdrawalService {
  constructor(private readonly prisma: PrismaService) {}

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

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Solo se pueden actualizar solicitudes pendientes',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: dto.status,
          updatedAt: new Date(),
        },
      });

      if (dto.status === 'APPROVED') {
        await tx.capitalTransaction.create({
          data: {
            amount: result.amount,
            type: 'WITHDRAWAL',
            description: `Retiro aprobado para usuario ${result.userId}`,
            referenceId: result.id,
          },
        });

        await tx.commission.updateMany({
          where: {
            userId: result.userId,
            status: 'PENDING',
          },
          data: {
            status: 'PAID',
          },
        });
      }

      return result;
    });

    return ok(
      updated,
      `Solicitud de retiro ${dto.status.toLowerCase()} correctamente`,
    );
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
