import { SaleType } from '@prisma/client';
import { IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';

export class CreateSaleDto {
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
  salePrice: number;

  @IsNumber()
  customerId: number;

  @IsNumber()
  userId: number; // vendedor que registró la venta
  @IsOptional()
  @IsString()
  referralCode?: string;
  @IsOptional()
  @IsEnum(SaleType)
  type?: SaleType;

  @IsOptional()
  @IsString()
  notes?: string;
}
