import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttributeValueDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}
