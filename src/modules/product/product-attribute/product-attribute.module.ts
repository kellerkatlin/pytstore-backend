import { Module } from '@nestjs/common';
import { ProductAttributeService } from './product-attribute.service';
import { ProductAttributeController } from './product-attribute.controller';

@Module({
  providers: [ProductAttributeService],
  controllers: [ProductAttributeController]
})
export class ProductAttributeModule {}
