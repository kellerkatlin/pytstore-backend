import { SaleType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class CreateSaleItemDto {
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsNumber()
  variantId?: number;

  @IsOptional()
  @IsNumber()
  productItemId?: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  salePrice: number;
}

export class CreateSaleDto {
  @IsNumber()
  @IsOptional()
  customerId?: number;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsEnum(SaleType)
  type?: SaleType;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
