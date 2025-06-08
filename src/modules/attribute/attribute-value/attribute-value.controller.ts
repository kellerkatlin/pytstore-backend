import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AttributeValueService } from './attribute-value.service';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';

@Controller('attribute-value')
export class AttributeValueController {
  constructor(private readonly service: AttributeValueService) {}

  @Post()
  create(@Body() dto: CreateAttributeValueDto) {
    return this.service.create(dto);
  }

  @Get(':attributeId')
  findByAttribute(@Param('attributeId', ParseIntPipe) id: number) {
    return this.service.findByAttribute(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
