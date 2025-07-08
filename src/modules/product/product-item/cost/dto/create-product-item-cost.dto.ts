import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CostDetailType } from '@prisma/client';

export class CreateProductItemCostDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CostDetailType)
  type: CostDetailType;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}
