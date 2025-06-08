import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateAttributeValueDto {
  @IsInt()
  attributeId: number;

  @IsNotEmpty()
  @IsString()
  value: string;
}
