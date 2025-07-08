import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CapitalService } from './capital.service';
import { FilterCapitalTransactionDto } from './dto/filter-capital-transaction.dto';
import { ok } from 'src/common/helpers/response.helper';
import { IncomeStatementDto } from './dto/income-statement.dto';
import { CreateCapitalTransactionDto } from './dto/create-capital-transaction.dto';

@Controller('capital')
export class CapitalController {
  constructor(private readonly service: CapitalService) {}
  // Este endpoint es para obtener el resumen de capital por cuenta
  @Auth('SUPERADMIN', 'ADMIN')
  @Get('summary')
  getSummary() {
    return this.service.getSummary();
  }
  // Este endpoint es para obtener los movimientos de capital
  @Auth('SUPERADMIN', 'ADMIN')
  @Get('transactions')
  getTransactions(@Query() query: FilterCapitalTransactionDto) {
    return this.service.getTransactions(query);
  }
  // Este endpoint es para obtener el resumen completo de capital
  @Auth('SUPERADMIN', 'ADMIN')
  @Get('full-summary')
  getFullSummary() {
    return this.service.getFullSummary();
  }
  // Este endpoint es para obtener el capital disponible
  @Auth('SUPERADMIN')
  @Get('balance')
  getBalance() {
    return this.service.getBalanceGeneral();
  }
  // Este endpoint es para generar el estado de resultados
  @Auth('SUPERADMIN')
  @Get('income-statement')
  async getIncomeStatement(@Query() query: IncomeStatementDto) {
    const data = await this.service.getIncomeStatement(query);
    return ok(data, 'Estado de resultados generado');
  }

  @Auth('SUPERADMIN')
  @Post()
  createTransaction(@Body() dto: CreateCapitalTransactionDto) {
    return this.service.createTransaction(dto);
  }
}
