import { IsNumber, IsOptional } from 'class-validator';

export class CreatePurchaseItemDto {
  @IsNumber() unitCost: number;

  @IsNumber()
  productId: number;
  @IsNumber() quantity: number;

  @IsOptional()
  @IsNumber()
  variantId?: number;
}
