import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { FilterProductDto } from './dto/filter-product.dto';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Auth('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }
  @Auth('SUPERADMIN', 'ADMIN', 'SELLER')
  @Get()
  findAll(@Query() query: FilterProductDto) {
    return this.service.findAll(query);
  }

  @Auth('SUPERADMIN', 'ADMIN', 'SELLER')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
