import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
  ValidateNested,
  ArrayMaxSize,
  IsString,
} from 'class-validator';
import { CommissionType, ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ProductImageInputDto } from '../product-image/dto/product-image-input.dto';

export class CreateProductDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsInt()
  categoryId: number;

  @IsInt()
  brandId: number;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsEnum(CommissionType)
  commissionType: CommissionType;

  @IsNumber()
  @Min(0)
  commissionValue: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  gainValue: number;
  @IsOptional()
  @IsString()
  gainType: CommissionType;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  @ArrayMaxSize(10) // por ejemplo, max 10  imágenes
  images?: ProductImageInputDto[];
}
