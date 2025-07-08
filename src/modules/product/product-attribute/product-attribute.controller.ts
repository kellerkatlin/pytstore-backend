import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { ProductAttributeService } from './product-attribute.service';

@Auth('SUPERADMIN', 'ADMIN')
@Controller('product-attribute')
export class ProductAttributeController {
  constructor(private readonly service: ProductAttributeService) {}

  @Get(':productId/attributes')
  async getAssignedAttributes(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: { page?: number; limit?: number; search?: string },
  ) {
    return this.service.getAssignedAttributes(productId, query);
  }

  @Get(':productId/attributes/:attributeId/values')
  async getAssignedAttributeValues(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Query() query: { page?: number; limit?: number; search?: string },
  ) {
    return this.service.getAssignedAttributeValues(
      productId,
      attributeId,
      query,
    );
  }

  @Get(':productId/unassigned-attributes')
  async getUnassignedAttributes(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: { search?: string; page?: number; limit?: number },
  ) {
    return this.service.getUnassignedAttributes(productId, query);
  }

  @Get(':productId/attributes/:attributeId/unassigned-values')
  async getUnassignedValues(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Query() query: { search?: string; page?: number; limit?: number },
  ) {
    return this.service.getUnassignedValues(productId, attributeId, query);
  }

  @Post(':productId/attributes')
  async assignAttribute(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: { attributeId: number },
  ) {
    return this.service.assignAttribute(productId, dto.attributeId);
  }

  @Post(':productId/attributes/:attributeId/values')
  async assignValue(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Body() dto: { valueId: number },
  ) {
    return this.service.assignValue(productId, attributeId, dto.valueId);
  }

  @Delete(':productId/attributes/:attributeId')
  async unassignAttribute(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('attributeId', ParseIntPipe) attributeId: number,
  ) {
    return this.service.unassignAttribute(productId, attributeId);
  }

  @Delete(':productId/attributes/:attributeId/values/:valueId')
  async unassignSingleValue(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Param('valueId', ParseIntPipe) valueId: number,
  ) {
    return this.service.unassignValue(productId, attributeId, valueId);
  }
}
