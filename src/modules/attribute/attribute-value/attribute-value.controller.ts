import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AttributeValueService } from './attribute-value.service';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { FilterAttributeValueDto } from './dto/filter-attribute-value.dto';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';

@Auth('SUPERADMIN', 'ADMIN')
@Controller('attribute-value')
export class AttributeValueController {
  constructor(private readonly service: AttributeValueService) {}

  @Get(':attributeId')
  findByAttribute(
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Query() query: FilterAttributeValueDto,
  ) {
    return this.service.findByAttribute(attributeId, query);
  }

  @Get(':id/value')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }
  @Post(':attributeId/values')
  create(
    @Body() dto: CreateAttributeValueDto,
    @Param('attributeId', ParseIntPipe) attributeId: number,
  ) {
    return this.service.create(attributeId, dto);
  }

  @Put('/attribute-values/:id')
  updateValue(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttributeValueDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
