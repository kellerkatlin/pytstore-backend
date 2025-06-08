import { Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';

@Module({
  providers: [ProductImageService],
  controllers: [ProductImageController],
})
export class ProductImageModule {}
