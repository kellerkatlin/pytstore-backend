import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsUrl,
} from 'class-validator';

export class CreateSellerDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string; // Nombre del usuario

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  storeName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  businessName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{9}$/, {
    message: 'El teléfono debe tener exactamente 9 dígitos',
  })
  phone?: string;
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$|^\d{11}$/, {
    message: 'El documento debe tener 8 (DNI) o 11 (RUC) dígitos',
  })
  ruc?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  logoUrl?: string;
}
