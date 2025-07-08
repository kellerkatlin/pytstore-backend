import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
  IsString,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { CommissionType, ProductStatus } from '@prisma/client';
import { ProductImageInputDto } from '../product-image/dto/product-image-input.dto';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsEnum(CommissionType)
  commissionType?: CommissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionValue?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  @ArrayMaxSize(10) // por ejemplo, max 10  imágenes
  images?: ProductImageInputDto[];
}
