// src/sale/dto/pay-sale.dto.ts
import { IsInt, IsUrl } from 'class-validator';

export class PaySaleDto {
  @IsInt()
  paymentMethodId: number;

  @IsUrl()
  documentUrl: string;
}
