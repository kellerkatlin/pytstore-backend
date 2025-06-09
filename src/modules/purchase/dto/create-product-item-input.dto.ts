import { IsNumber, IsString } from 'class-validator';

export class CreateProductItemInputDto {
  @IsString() serialCode: string;
  @IsString() condition: string;
  @IsString() functionality: string;

  @IsNumber() cost: number;
  @IsNumber() salePrice: number;
}
