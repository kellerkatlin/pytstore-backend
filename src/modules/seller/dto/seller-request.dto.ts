// src/auth/dto/vendor-request.dto.ts
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SellerRequestDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsPhoneNumber('PE') // ajusta el país si es necesario
  phone?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
