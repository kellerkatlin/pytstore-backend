import { Module } from '@nestjs/common';
import { ProductItemSellerService } from './product-item-seller.service';
import { ProductItemSellerController } from './product-item-seller.controller';
import { ProductItemImageModule } from 'src/modules/product/product-item/image/product-item-image.module';

@Module({
  imports: [ProductItemImageModule],
  providers: [ProductItemSellerService],
  controllers: [ProductItemSellerController],
})
export class ProductItemSellerModule {}
