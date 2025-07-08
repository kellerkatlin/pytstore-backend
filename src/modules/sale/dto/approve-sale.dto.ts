import { CostDetailType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class SaleExtraCostDto {
  @IsEnum(CostDetailType)
  type: CostDetailType;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsUrl()
  documentUrl?: string;
}

export class ApproveSaleDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleExtraCostDto)
  additionalCosts?: SaleExtraCostDto[];
}
