import { Module } from '@nestjs/common';
import { StockService } from './stock/stock.service';
import { S3Service } from './s3/s3.service';

@Module({
  providers: [StockService, S3Service],
  exports: [StockService, S3Service],
})
export class ServiceCommonModule {}
