import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ProductItemImageService } from './product-item-image.service';
import { CreateProductItemImageDto } from './dto/create-product-item-image.dto';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';

@Auth('SUPERADMIN', 'ADMIN')
@Controller('product-item-image')
export class ProductItemImageController {
  constructor(private readonly service: ProductItemImageService) {}

  @Post()
  create(@Body() dto: CreateProductItemImageDto) {
    return this.service.create(dto);
  }

  @Get(':itemId')
  findByItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.service.findByItem(itemId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
