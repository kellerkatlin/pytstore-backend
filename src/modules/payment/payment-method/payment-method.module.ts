import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodController } from './payment-method.controller';

@Module({
  providers: [PaymentMethodService],
  controllers: [PaymentMethodController]
})
export class PaymentMethodModule {}
