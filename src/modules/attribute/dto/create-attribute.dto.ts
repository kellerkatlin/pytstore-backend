import { AttributeStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsEnum(AttributeStatus)
  status: AttributeStatus;
}
