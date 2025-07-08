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
import { Auth } from '../auth/decorators/auth.decorator';
import { FilterProductDto } from './dto/filter-product.dto';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ok } from 'src/common/helpers/response.helper';

@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Auth('SUPERADMIN', 'ADMIN')
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Auth('SUPERADMIN', 'ADMIN', 'SELLER')
  @Get()
  async findAll(@Query() query: FilterProductDto) {
    return this.service.findAll(query);
  }

  @Auth('SUPERADMIN', 'ADMIN', 'SELLER')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Auth('SUPERADMIN', 'ADMIN', 'SELLER')
  @Get(':id/attribute-value-tree')
  async getAttributeValueTree(@Param('id', ParseIntPipe) id: number) {
    return this.service.getAttributeValueTree(id);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Get(':id/stock')
  async findOneStock(@Param('id', ParseIntPipe) id: number) {
    const product = await this.service.findOne(id);
    const stock = await this.service.calculateStock(id);

    return ok({ ...product.data, stockReal: stock }, 'Producto con stock real');
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
