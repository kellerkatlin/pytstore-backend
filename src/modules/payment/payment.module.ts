import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentMethodModule } from './payment-method/payment-method.module';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  imports: [PaymentMethodModule]
})
export class PaymentModule {}
