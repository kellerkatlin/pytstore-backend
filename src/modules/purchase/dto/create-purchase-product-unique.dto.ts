import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { CreateProductItemInputDto } from './create-product-item-input.dto';

export class CreatePurchaseProductUniqueDto {
  @IsString() providerName: string;
  @IsString() invoiceCode: string;
  @IsDateString() purchaseDate: string;

  @IsUrl()
  documentUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductItemInputDto)
  items: CreateProductItemInputDto[];
}
