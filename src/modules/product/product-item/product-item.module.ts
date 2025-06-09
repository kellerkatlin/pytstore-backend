import { Module } from '@nestjs/common';
import { ProductItemController } from './product-item.controller';
import { ProductItemService } from './product-item.service';
import { ProductItemImageModule } from './image/product-item-image.module';

@Module({
  controllers: [ProductItemController],
  providers: [ProductItemService],
  imports: [ProductItemImageModule],
})
export class ProductItemModule {}
