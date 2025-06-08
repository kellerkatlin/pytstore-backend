import {
  IsNotEmpty,
  IsInt,
  IsUrl,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateProductImageDto {
  @IsInt()
  productId: number;

  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
