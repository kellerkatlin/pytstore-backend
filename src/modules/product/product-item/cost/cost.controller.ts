import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { CostService } from './cost.service';
import { CreateProductItemCostDto } from './dto/create-product-item-cost.dto';
import { UpdateProductItemCostDto } from './dto/update-product-item-cost.dto';

@Auth('SUPERADMIN', 'ADMIN')
@Controller('product-items/:itemId/costs')
export class CostController {
  constructor(private readonly service: CostService) {}

  @Get()
  findAll(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.service.findAllByItem(itemId);
  }

  @Get(':costId')
  findOne(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('costId', ParseIntPipe) costId: number,
  ) {
    return this.service.findOne(itemId, costId);
  }
  @Post()
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateProductItemCostDto,
  ) {
    return this.service.create(itemId, dto);
  }

  @Patch(':costId')
  update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('costId', ParseIntPipe) costId: number,
    @Body() dto: UpdateProductItemCostDto,
  ) {
    return this.service.update(itemId, costId, dto);
  }

  @Delete(':costId')
  remove(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('costId', ParseIntPipe) costId: number,
  ) {
    return this.service.remove(itemId, costId);
  }
}
