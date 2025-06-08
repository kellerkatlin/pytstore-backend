import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';

@Controller('product-variant')
export class ProductVariantController {
  constructor(private readonly service: ProductVariantService) {}

  @Auth('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateProductVariantDto) {
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
