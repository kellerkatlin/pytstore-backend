import { IsEnum, IsOptional } from 'class-validator';
import { CommissionStatus } from '@prisma/client';

export class FilterCommissionDto {
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;
}
