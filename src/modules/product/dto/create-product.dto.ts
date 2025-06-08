import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { CommissionType } from '@prisma/client';

export class CreateProductDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  categoryId: number;

  @IsInt()
  brandId: number;

  @IsEnum(CommissionType)
  commissionType: CommissionType;

  @IsNumber()
  @Min(0)
  commissionValue: number;
}
