import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerType } from '@prisma/client';

export class AddressDto {
  @IsString()
  addressLine: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsEnum(CustomerType)
  customerType: CustomerType;

  @IsOptional()
  @IsString()
  @Length(8, 8, { message: 'DNI debe tener 8 dígitos' })
  dni?: string;

  @IsOptional()
  @IsString()
  @Length(11, 11, { message: 'RUC debe tener 11 dígitos' })
  ruc?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Length(7, 20)
  phone: string;

  @ValidateNested()
  @Type(() => AddressDto)
  addresses: AddressDto[];
}
