import { IsNumber, IsPositive } from 'class-validator';

export class CreateProductItemInputDto {
  @IsNumber()
  productItemId: number;

  @IsPositive()
  @IsNumber()
  unitCost: number;
}
