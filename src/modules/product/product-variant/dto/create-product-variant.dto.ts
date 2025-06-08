import {
  IsInt,
  IsNumber,
  IsPositive,
  IsUrl,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsInt()
  productId: number;

  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  stock: number;

  @IsUrl()
  imageUrl: string;

  @IsBoolean()
  isActive: boolean;
}
