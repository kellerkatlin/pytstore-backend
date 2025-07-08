import { IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class ProductItemImageInputDto {
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
