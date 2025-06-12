import { IsOptional, IsDateString } from 'class-validator';

export class IncomeStatementDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
