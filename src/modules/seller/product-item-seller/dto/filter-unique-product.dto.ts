import { ProductCondition } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FilterProductDto } from 'src/modules/product/dto/filter-product.dto';

export class FilterUniqueProductDto extends FilterProductDto {
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;
  @IsOptional()
  @IsString()
  functionality?: string;
}
