// create-brand.dto.ts
import { BrandStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsEnum(BrandStatus)
  status: BrandStatus;

  @IsNotEmpty()
  @IsString()
  name: string;
}
