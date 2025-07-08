import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ok, paginated } from 'src/common/helpers/response.helper';
import { FilterCapitalTransactionDto } from './dto/filter-capital-transaction.dto';
import { CapitalAccountName, CapitalType, Prisma } from '@prisma/client';
import { IncomeStatementDto } from './dto/income-statement.dto';
import { CreateCapitalTransactionDto } from './dto/create-capital-transaction.dto';

@Injectable()
export class CapitalService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const accounts = await this.prisma.capitalAccount.findMany();

    const summary = await Promise.all(
      accounts.map(async (account) => {
        const [incoming, outgoing] = await Promise.all([
          this.prisma.capitalTransaction.aggregate({
            _sum: { amount: true },
            where: { accountId: account.id },
          }),
          this.prisma.capitalTransaction.aggregate({
            _sum: { amount: true },
            where: { originAccountId: account.id },
          }),
        ]);

        const totalIn = incoming._sum.amount ?? 0;
        const totalOut = outgoing._sum.amount ?? 0;

        return {
          account: account.name,
          total: totalIn - totalOut,
        };
      }),
    );

    return ok(summary, 'Resumen de capital por cuenta');
  }
  async getTransactions(query: FilterCapitalTransactionDto) {
    const {
      page = 1,
      limit = 10,
      type,
      referenceType,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    let accountId: number | undefined;

    if (query.account) {
      const account = await this.prisma.capitalAccount.findUnique({
        where: { name: query.account }, // CapitalAccountName
      });

      if (!account) {
        throw new Error(`Cuenta ${query.account} no encontrada`);
      }

      accountId = account.id;
    }

    const where: Prisma.CapitalTransactionWhereInput = {
      ...(accountId && { accountId }),
      ...(type && { type }),
      ...(referenceType && { referenceType }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.capitalTransaction.findMany({
        where,
        skip,
        take: +limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: true,
          originAccount: true,
        },
      }),
      this.prisma.capitalTransaction.count({ where }),
    ]);

    return paginated(
      data,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Listado de movimientos de capital',
    );
  }

  async getAvailableCapital(): Promise<number> {
    const caja = await this.prisma.capitalAccount.findFirst({
      where: { name: CapitalAccountName.CASH },
      include: { transactions: true },
    });

    if (!caja) return 0;

    return caja.transactions.reduce((acc, tx) => {
      const sign = ['INJECTION', 'SALE_PROFIT'].includes(tx.type) ? 1 : -1;
      return acc + sign * tx.amount;
    }, 0);
  }

  async getAccountIdByName(name: CapitalAccountName): Promise<number> {
    const account = await this.prisma.capitalAccount.findUnique({
      where: { name },
    });
    if (!account) throw new Error(`Cuenta ${name} no existe`);
    return account.id;
  }

  async getAvailableCapitalByAccountId(accountId: number): Promise<number> {
    const [incoming, outgoing] = await Promise.all([
      this.prisma.capitalTransaction.aggregate({
        _sum: { amount: true },
        where: { accountId },
      }),
      this.prisma.capitalTransaction.aggregate({
        _sum: { amount: true },
        where: { originAccountId: accountId },
      }),
    ]);

    const totalIn = incoming._sum.amount ?? 0;
    const totalOut = outgoing._sum.amount ?? 0;

    return totalIn - totalOut;
  }

  async getFullSummary() {
    // Traer las cuentas
    const accounts = await this.prisma.capitalAccount.findMany({
      include: { transactions: true },
    });

    const capitalSummary = accounts.map((account) => {
      const total = account.transactions.reduce((acc, tx) => {
        const sign = ['INJECTION', 'SALE_PROFIT'].includes(tx.type) ? 1 : -1;
        return acc + sign * tx.amount;
      }, 0);
      return {
        account: account.name,
        total,
      };
    });

    // Total histórico de ventas (acumulado)
    const totalSales = await this.prisma.capitalTransaction.aggregate({
      _sum: { amount: true },
      where: { type: 'SALE_PROFIT' },
    });

    return ok(
      {
        capital: capitalSummary,
        totalSales: totalSales._sum.amount ?? 0,
      },
      'Resumen financiero completo',
    );
  }

  async getBalanceGeneral() {
    const accounts = await this.prisma.capitalAccount.findMany({
      include: { transactions: true },
    });

    const summary = accounts.map((account) => {
      const total = account.transactions.reduce((acc, tx) => {
        const sign = ['INJECTION', 'SALE_PROFIT', 'TRANSFER_IN'].includes(
          tx.type,
        )
          ? 1
          : -1;
        return acc + sign * tx.amount;
      }, 0);
      return { account: account.name, total };
    });

    // Comisiones pendientes (por retirar)
    const pendingCommissions = await this.prisma.commission.aggregate({
      _sum: { amount: true },
      where: { status: 'PENDING' },
    });

    const comisionesPendientes = pendingCommissions._sum.amount ?? 0;

    return ok(
      {
        balance: summary,
        comisionesPendientes,
      },
      'Balance general',
    );
  }

  private buildDateFilter(
    dto: IncomeStatementDto,
  ): Prisma.CapitalTransactionWhereInput {
    const filter: Prisma.CapitalTransactionWhereInput = {};

    if (dto.startDate || dto.endDate) {
      filter.createdAt = {};
      if (dto.startDate) {
        filter.createdAt.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        filter.createdAt.lte = new Date(dto.endDate);
      }
    }

    return filter;
  }

  async getIncomeStatement(dto: IncomeStatementDto) {
    const dateFilter = this.buildDateFilter(dto);

    const totalVentas = await this.prisma.capitalTransaction.aggregate({
      _sum: { amount: true },
      where: { type: CapitalType.SALE_PROFIT, ...dateFilter },
    });

    const totalCompras = await this.prisma.capitalTransaction.aggregate({
      _sum: { amount: true },
      where: { type: CapitalType.PURCHASE_EXPENSE, ...dateFilter },
    });

    const totalGastos = await this.prisma.capitalTransaction.aggregate({
      _sum: { amount: true },
      where: { type: CapitalType.OPERATIONAL_EXPENSE, ...dateFilter },
    });

    const totalDevoluciones = await this.prisma.capitalTransaction.aggregate({
      _sum: { amount: true },
      where: { type: CapitalType.DEVOLUTION_COST, ...dateFilter },
    });

    const totalRetiros = await this.prisma.capitalTransaction.aggregate({
      _sum: { amount: true },
      where: { type: CapitalType.WITHDRAWAL, ...dateFilter },
    });

    const ventas = totalVentas._sum.amount ?? 0;
    const compras = totalCompras._sum.amount ?? 0;
    const gastos = totalGastos._sum.amount ?? 0;
    const devoluciones = totalDevoluciones._sum.amount ?? 0;
    const retiros = totalRetiros._sum.amount ?? 0;

    const utilidadNeta = ventas - compras - gastos - devoluciones - retiros;

    return {
      ventas,
      compras,
      gastos,
      devoluciones,
      retiros,
      utilidadNeta,
    };
  }

  async createTransaction(dto: CreateCapitalTransactionDto) {
    const account = await this.prisma.capitalAccount.findUnique({
      where: { name: dto.account },
    });
    if (!account) throw new Error('Cuenta de capital no encontrada');

    const transaction = await this.prisma.capitalTransaction.create({
      data: {
        amount: dto.amount,
        type: dto.type,
        createdAt: dto.createdAt ?? new Date(),
        description: dto.description,
        referenceType: dto.referenceType ?? 'OTHER',
        referenceId: dto.referenceId ?? null,
        accountId: account.id,
      },
    });

    return ok(transaction, 'Transacción registrada correctamente');
  }
}
