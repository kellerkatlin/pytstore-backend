import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { StockModule } from 'src/common/services/stock/stock.module';

@Module({
  providers: [InventoryService],
  controllers: [InventoryController],
  imports: [StockModule],
})
export class InventoryModule {}
