import { Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { CapitalModule } from '../capital/capital.module';

@Module({
  providers: [WithdrawalService],
  controllers: [WithdrawalController],
  imports: [CapitalModule],
})
export class WithdrawalModule {}
