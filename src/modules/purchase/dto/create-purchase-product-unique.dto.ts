import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateProductItemInputDto } from './create-product-item-input.dto';

export class CreatePurchaseProductUniqueDto {
  @IsString() providerName: string;
  @IsString() invoiceCode: string;
  @IsDateString() purchaseDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductItemInputDto)
  items: CreateProductItemInputDto[];
}
