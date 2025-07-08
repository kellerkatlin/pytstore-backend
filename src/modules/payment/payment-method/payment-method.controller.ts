import { Controller, Get } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';

@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly service: PaymentMethodService) {}

  @Auth('SUPERADMIN')
  @Get()
  async getAll() {
    return await this.service.findAll();
  }
}
