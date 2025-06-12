import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { CapitalAccountName } from '@prisma/client';

export class CreateTransferDto {
  @IsEnum(CapitalAccountName)
  fromAccount: CapitalAccountName;

  @IsEnum(CapitalAccountName)
  toAccount: CapitalAccountName;

  @IsNumber()
  @IsPositive()
  amount: number;

  description?: string;
}
