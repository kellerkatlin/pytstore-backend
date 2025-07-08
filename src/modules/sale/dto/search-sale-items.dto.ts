// dto/search-sale-items.dto.ts
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class SearchSaleItemsDto {
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;
}
