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
import { ok } from 'src/common/helpers/response.helper';

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
  @Get(':variantId/stock')
  getStock(@Param('variantId', ParseIntPipe) id: number) {
    return this.service
      .calculateStockByVariant(id)
      .then((stock) => ok({ stock }, 'Stock actual de la variante'));
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Post(':id/generate-sku')
  generateSku(@Param('id', ParseIntPipe) id: number) {
    return this.service.generateSku(id);
  }
}
