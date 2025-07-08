import { CategoryStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsEnum(CategoryStatus)
  status: CategoryStatus;
  @IsString()
  @IsOptional()
  name?: string;
}
