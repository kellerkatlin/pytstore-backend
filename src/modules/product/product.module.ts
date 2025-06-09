import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductImageModule } from './product-image/product-image.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { ProductAttributeModule } from './product-attribute/product-attribute.module';
import { ProductItemModule } from './product-item/product-item.module';
import { StockModule } from 'src/common/services/stock/stock.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    ProductImageModule,
    ProductVariantModule,
    ProductAttributeModule,
    ProductItemModule,
    StockModule,
  ],
})
export class ProductModule {}
