// update-brand.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  name?: string;
}
