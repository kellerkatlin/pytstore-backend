import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginCustomerDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Puede ser teléfono o correo

  @IsString()
  @MinLength(6)
  password: string;
}
