import { Module } from '@nestjs/common';
import { ProductItemImageService } from './product-item-image.service';
import { ProductItemImageController } from './product-item-image.controller';

@Module({
  providers: [ProductItemImageService],
  controllers: [ProductItemImageController],
  exports: [ProductItemImageService],
})
export class ProductItemImageModule {}
