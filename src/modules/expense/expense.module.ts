import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { CapitalModule } from '../capital/capital.module';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [CapitalModule],
})
export class ExpenseModule {}
