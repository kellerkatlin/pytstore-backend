import { Module } from '@nestjs/common';
import { AttributeController } from './attribute.controller';
import { AttributeService } from './attribute.service';
import { AttributeValueModule } from './attribute-value/attribute-value.module';

@Module({
  controllers: [AttributeController],
  providers: [AttributeService],
  imports: [AttributeValueModule]
})
export class AttributeModule {}
