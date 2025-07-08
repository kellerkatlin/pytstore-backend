import {
  CapitalType,
  CapitalSourceType,
  CapitalAccountName,
} from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class FilterCapitalTransactionDto {
  @IsOptional()
  @IsEnum(CapitalAccountName)
  account?: CapitalAccountName;

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

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
