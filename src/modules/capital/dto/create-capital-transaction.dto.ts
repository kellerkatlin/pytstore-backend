import {
  CapitalAccountName,
  CapitalSourceType,
  CapitalType,
} from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCapitalTransactionDto {
  @IsEnum(CapitalType)
  type: CapitalType;

  @IsEnum(CapitalAccountName)
  account: CapitalAccountName;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(CapitalSourceType)
  referenceType?: CapitalSourceType;

  @IsOptional()
  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsInt()
  referenceId?: number;
}
