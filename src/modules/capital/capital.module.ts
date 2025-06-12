import { Module } from '@nestjs/common';
import { CapitalController } from './capital.controller';
import { CapitalService } from './capital.service';
import { CapitalTransferModule } from './capital-transfer/capital-transfer.module';

@Module({
  controllers: [CapitalController],
  providers: [CapitalService],
  exports: [CapitalService],
  imports: [CapitalTransferModule],
})
export class CapitalModule {}
