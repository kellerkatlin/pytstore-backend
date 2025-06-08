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
import { ProductAttributeService } from './product-attribute.service';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';

@Auth('SUPERADMIN', 'ADMIN')
@Controller('product-attribute')
export class ProductAttributeController {
  constructor(private readonly service: ProductAttributeService) {}

  @Post()
  assign(@Body() dto: CreateProductAttributeDto) {
    return this.service.assign(dto);
  }

  @Get(':productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.findByProduct(productId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
