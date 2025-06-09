import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { ProductItemService } from './product-item.service';
import { CreateProductItemDto } from './dto/create-product-item.dto';

@Controller('product-item')
export class ProductItemController {
  constructor(private readonly service: ProductItemService) {}

  @Auth('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateProductItemDto) {
    return this.service.create(dto);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Get(':productId')
  findByProduct(@Param('productId', ParseIntPipe) id: number) {
    return this.service.findByProduct(id);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
