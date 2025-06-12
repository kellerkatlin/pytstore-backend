import { Module } from '@nestjs/common';
import { CapitalTransferService } from './capital-transfer.service';
import { CapitalTransferController } from './capital-transfer.controller';

@Module({
  providers: [CapitalTransferService],
  controllers: [CapitalTransferController]
})
export class CapitalTransferModule {}
