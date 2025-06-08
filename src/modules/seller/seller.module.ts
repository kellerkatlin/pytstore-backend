import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { ReferralModule } from 'src/common/referral/referral.module';

@Module({
  providers: [SellerService],
  controllers: [SellerController],
  exports: [SellerService],
  imports: [ReferralModule],
})
export class SellerModule {}
