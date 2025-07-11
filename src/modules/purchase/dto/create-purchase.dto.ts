import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { CreatePurchaseItemDto } from './create-purchase-item.dto';

export class CreatePurchaseDto {
  @IsString() providerName: string;
  @IsString() invoiceCode: string;
  @IsDateString() purchaseDate: string;
  @IsUrl()
  documentUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
