import { IsOptional, IsString } from 'class-validator';
import { FilterProductDto } from 'src/modules/product/dto/filter-product.dto';

export class FilterUniqueProductDto extends FilterProductDto {
  @IsOptional()
  @IsString()
  condition?: string;
  @IsOptional()
  @IsString()
  functionality?: string;
}
