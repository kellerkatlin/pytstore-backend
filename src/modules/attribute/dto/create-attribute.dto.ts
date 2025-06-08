import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateAttributeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsInt()
  categoryId: number;
}
