// src/auth/dto/checkout.dto.ts
import { Address } from '@prisma/client';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CheckoutDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('PE') // Puedes cambiar el país si necesitas internacional
  phone?: string;

  @IsString()
  @MinLength(5)
  address: Address;
}
