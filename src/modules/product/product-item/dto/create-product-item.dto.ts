import { CommissionType } from '@prisma/client';
import {
  IsString,
  IsInt,
  IsNumber,
  Min,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateProductItemDto {
  @IsInt()
  productId: number;

  @IsString()
  @IsNotEmpty()
  serialCode: string;

  @IsString()
  @IsNotEmpty()
  condition: string;

  @IsString()
  @IsNotEmpty()
  functionality: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @Min(0)
  salePrice: number;

  @IsBoolean()
  available: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionValue?: number;
  @IsOptional()
  @IsString()
  commissionType?: CommissionType;
}
