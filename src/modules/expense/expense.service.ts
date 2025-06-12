import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CapitalService } from '../capital/capital.service';
import {
  CapitalAccountName,
  CapitalSourceType,
  CapitalType,
} from '@prisma/client';
import { ok } from 'src/common/helpers/response.helper';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly capitalService: CapitalService,
  ) {}

  async create(dto: CreateExpenseDto, userId: number) {
    const accountId = await this.capitalService.getAccountIdByName(
      CapitalAccountName.CASH,
    );
    const available =
      await this.capitalService.getAvailableCapitalByAccountId(accountId);

    if (dto.amount > available) {
      throw new BadRequestException(
        'No hay suficiente dinero en CAJA para este gasto',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          ...dto,
          createdById: userId,
        },
      });

      await tx.capitalTransaction.create({
        data: {
          amount: dto.amount,
          type: CapitalType.OPERATIONAL_EXPENSE,
          referenceType: CapitalSourceType.EXPENSE,
          referenceId: expense.id,
          description: dto.description,
          accountId,
          expenseId: expense.id,
        },
      });

      return ok(expense, 'Gasto registrado correctamente');
    });
  }

  async findAll() {
    const expenses = await this.prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return ok(expenses, 'Listado de gastos');
  }
}
