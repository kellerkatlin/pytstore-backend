import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductItemInputDto } from './create-product-item-input.dto';

export class CreatePurchaseItemDto {
  @IsNumber() productId: number;
  @IsNumber() unitCost: number;
  @IsNumber() quantity: number;

  @IsOptional()
  @IsNumber()
  variantId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductItemInputDto)
  items?: CreateProductItemInputDto[];
}
