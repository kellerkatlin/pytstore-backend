import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsUrl,
} from 'class-validator';

export class UpdateSellerDto {
  // === Usuario ===

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  // === Seller ===

  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{9}$/, {
    message: 'El teléfono debe tener exactamente 9 dígitos',
  })
  phone?: string;

  @IsOptional()
  @Matches(/^\d{11}$/, {
    message: 'El RUC debe tener exactamente 11 dígitos',
  })
  ruc?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  logoUrl?: string;
}
