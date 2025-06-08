import { Module } from '@nestjs/common';
import { VariantAttributeService } from './variant-attribute.service';
import { VariantAttributeController } from './variant-attribute.controller';

@Module({
  providers: [VariantAttributeService],
  controllers: [VariantAttributeController]
})
export class VariantAttributeModule {}
