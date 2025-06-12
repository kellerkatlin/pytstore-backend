import { CapitalType, CapitalSourceType } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

export class FilterCapitalTransactionDto {
  @IsOptional()
  @IsNumberString()
  accountId?: number;

  @IsOptional()
  @IsEnum(CapitalType)
  type?: CapitalType;

  @IsOptional()
  @IsEnum(CapitalSourceType)
  referenceType?: CapitalSourceType;

  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;
}
