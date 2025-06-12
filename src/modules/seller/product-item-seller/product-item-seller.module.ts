import { Module } from '@nestjs/common';
import { ProductItemSellerService } from './product-item-seller.service';
import { ProductItemSellerController } from './product-item-seller.controller';

@Module({
  providers: [ProductItemSellerService],
  controllers: [ProductItemSellerController]
})
export class ProductItemSellerModule {}
