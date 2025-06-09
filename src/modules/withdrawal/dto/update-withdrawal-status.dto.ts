import { IsEnum } from 'class-validator';
import { WithdrawalStatus } from '@prisma/client';

export class UpdateWithdrawalStatusDto {
  @IsEnum(WithdrawalStatus)
  status: WithdrawalStatus; // APPROVED | REJECTED | CANCELED
}
