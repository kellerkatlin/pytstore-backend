import { IsInt } from 'class-validator';

export class CreateVariantAttributeDto {
  @IsInt()
  variantId: number;

  @IsInt()
  attributeId: number;

  @IsInt()
  valueId: number;
}
