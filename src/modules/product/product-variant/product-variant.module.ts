import { Module } from '@nestjs/common';
import { ProductVariantController } from './product-variant.controller';
import { ProductVariantService } from './product-variant.service';
import { VariantAttributeModule } from './variant-attribute/variant-attribute.module';

@Module({
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
  imports: [VariantAttributeModule]
})
export class ProductVariantModule {}
