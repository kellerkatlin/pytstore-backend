import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { CreateProductImageDto } from './dto/create-product-image.dto';

@Controller('product-image')
export class ProductImageController {
  constructor(private readonly service: ProductImageService) {}

  @Auth('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateProductImageDto) {
    return this.service.create(dto);
  }

  @Auth('SUPERADMIN', 'ADMIN', 'SELLER')
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
