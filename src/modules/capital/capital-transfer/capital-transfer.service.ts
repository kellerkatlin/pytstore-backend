import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ok } from 'src/common/helpers/response.helper';
import { CapitalSourceType, CapitalType } from '@prisma/client';

@Injectable()
export class CapitalTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async transfer(dto: CreateTransferDto) {
    if (dto.fromAccount === dto.toAccount) {
      throw new BadRequestException('Las cuentas deben ser diferentes');
    }

    return await this.prisma.$transaction(async (tx) => {
      const fromAccount = await tx.capitalAccount.findUnique({
        where: { name: dto.fromAccount },
      });

      const toAccount = await tx.capitalAccount.findUnique({
        where: { name: dto.toAccount },
      });

      if (!fromAccount || !toAccount) {
        throw new BadRequestException('Cuenta inválida');
      }

      const movements = await tx.capitalTransaction.findMany({
        where: { accountId: fromAccount.id },
      });

      const saldo = movements.reduce((acc, tx) => {
        const sign = ['INJECTION', 'SALE_PROFIT', 'TRANSFER_IN'].includes(
          tx.type,
        )
          ? 1
          : -1;
        return acc + sign * tx.amount;
      }, 0);

      if (dto.amount > saldo) {
        throw new BadRequestException('Fondos insuficientes en cuenta origen');
      }

      // Salida de fondos
      await tx.capitalTransaction.create({
        data: {
          amount: dto.amount,
          type: CapitalType.TRANSFER_OUT,
          referenceType: CapitalSourceType.OTHER,
          description:
            dto.description ?? `Transferencia hacia ${dto.toAccount}`,
          accountId: fromAccount.id,
        },
      });

      // Entrada de fondos
      await tx.capitalTransaction.create({
        data: {
          amount: dto.amount,
          type: CapitalType.TRANSFER_IN,
          referenceType: CapitalSourceType.OTHER,
          description:
            dto.description ?? `Transferencia desde ${dto.fromAccount}`,
          accountId: toAccount.id,
        },
      });

      return ok({
        message: 'Transferencia realizada con éxito',
        fromAccount: fromAccount.name,
      });
    });
  }
}
