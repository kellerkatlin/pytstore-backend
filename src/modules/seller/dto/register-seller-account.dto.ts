// dto/finish-vendor-registration.dto.ts
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterSellerDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Datos extra que pidas en el formulario

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  ruc: string | null;
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  companyName: string | null;

  @IsString()
  logoUrl: string | null;

  @IsString()
  storeName: string | null;
  @IsString()
  @MinLength(3)
  name: string;
}
