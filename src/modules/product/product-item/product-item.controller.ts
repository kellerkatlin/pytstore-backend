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
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { ProductItemService } from './product-item.service';
import { CreateProductItemDto } from './dto/create-product-item.dto';

import { UpdateProductItemDto } from './dto/update-product-item.dto';
import { FilterProductDto } from '../dto/filter-product.dto';

@Controller('product-item')
export class ProductItemController {
  constructor(private readonly service: ProductItemService) {}

  @Auth('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateProductItemDto) {
    return this.service.create(dto);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Get()
  findAllUniqueProducts(@Query() query: FilterProductDto) {
    return this.service.findAllUniqueProducts(query);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Get(':productId')
  async findByUniqueProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.service.findByUniqueProduct(+productId);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductItemDto,
  ) {
    return this.service.update(id, dto);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
