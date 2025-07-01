// update-brand.dto.ts
import { BrandStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @IsEnum(BrandStatus)
  status: BrandStatus;

  @IsOptional()
  @IsString()
  name?: string;
}
