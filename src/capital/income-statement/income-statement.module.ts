import { Module } from '@nestjs/common';
import { IncomeStatementController } from './income-statement.controller';
import { IncomeStatementService } from './income-statement.service';

@Module({
  controllers: [IncomeStatementController],
  providers: [IncomeStatementService]
})
export class IncomeStatementModule {}
