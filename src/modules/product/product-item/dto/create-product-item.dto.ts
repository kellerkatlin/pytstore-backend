import { CommissionType, TaxAffectationType } from '@prisma/client';
import {
  IsString,
  IsInt,
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductItemImageInputDto } from '../image/dto/product-item-image-input.dto';

export class CreateProductItemDto {
  @IsInt()
  productId: number;

  @IsEnum(TaxAffectationType)
  taxType: TaxAffectationType;

  @IsString()
  @IsNotEmpty()
  serialCode: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  salePrice?: number;

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
  gainValue: number;
  @IsOptional()
  @IsString()
  gainType: CommissionType;

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
