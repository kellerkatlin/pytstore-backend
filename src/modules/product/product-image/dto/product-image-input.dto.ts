import { IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class ProductImageInputDto {
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
