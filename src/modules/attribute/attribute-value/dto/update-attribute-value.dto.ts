import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAttributeValueDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}
