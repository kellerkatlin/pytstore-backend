import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { ServiceCommonModule } from 'src/common/services/service.module';

@Module({
  providers: [InventoryService],
  controllers: [InventoryController],
  imports: [ServiceCommonModule],
})
export class InventoryModule {}
