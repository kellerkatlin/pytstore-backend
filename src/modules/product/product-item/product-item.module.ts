import { Module } from '@nestjs/common';
import { ProductItemController } from './product-item.controller';
import { ProductItemService } from './product-item.service';
import { ProductItemImageModule } from './image/product-item-image.module';
import { CostService } from './cost/cost.service';
import { CostController } from './cost/cost.controller';
import { CostModule } from './cost/cost.module';

@Module({
  controllers: [ProductItemController, CostController],
  providers: [ProductItemService, CostService],
  imports: [ProductItemImageModule, CostModule],
})
export class ProductItemModule {}
