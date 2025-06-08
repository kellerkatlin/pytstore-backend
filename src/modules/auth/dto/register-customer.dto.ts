// dto/register-customer.dto.ts
import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterCustomerDto {
  @IsString()
  @Matches(/^\d+$/, { message: 'El teléfono debe contener solo números' })
  readonly phone: string;

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  readonly password?: string;
}
