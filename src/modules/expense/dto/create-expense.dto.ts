import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ExpenseType } from '@prisma/client';

export class CreateExpenseDto {
  @IsEnum(ExpenseType)
  type: ExpenseType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  description: string;
}
