import { CommissionType, TaxAffectationType } from '@prisma/client';
import {
  ArrayMaxSize,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductItemImageInputDto } from '../image/dto/product-item-image-input.dto';
import { Type } from 'class-transformer';

export class UpdateProductItemDto {
  @IsInt()
  productId: number;

  @IsString()
  @IsNotEmpty()
  serialCode: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(TaxAffectationType)
  taxType?: TaxAffectationType;

  @IsNumber()
  @Min(0)
  salePrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionValue?: number;
  @IsOptional()
  @IsString()
  commissionType?: CommissionType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  gainValue?: number;
  @IsOptional()
  @IsString()
  gainType?: CommissionType;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductItemImageInputDto)
  @ArrayMaxSize(10) // por ejemplo, max 10  imágenes
  images?: ProductItemImageInputDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductItemAttributeInputDto)
  attributes?: ProductItemAttributeInputDto[];
}

export class ProductItemAttributeInputDto {
  @IsInt()
  attributeId: number;

  @IsInt()
  valueId: number;
}
