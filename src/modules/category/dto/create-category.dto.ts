import { CategoryStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsEnum(CategoryStatus)
  status: CategoryStatus;

  @IsString()
  @IsNotEmpty()
  name: string;
}
