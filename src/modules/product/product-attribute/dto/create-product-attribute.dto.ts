import { IsInt } from 'class-validator';

export class CreateProductAttributeDto {
  @IsInt()
  productId: number;

  @IsInt()
  attributeId: number;

  @IsInt()
  valueId: number;
}
