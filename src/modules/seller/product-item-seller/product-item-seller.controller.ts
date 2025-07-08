import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductItemSellerService } from './product-item-seller.service';
import { FilterUniqueProductDto } from './dto/filter-unique-product.dto';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';

@Controller('product-item-seller')
export class ProductItemSellerController {
  constructor(
    private readonly productItemSellerService: ProductItemSellerService,
  ) {}

  @Auth('SELLER')
  @Get()
  async findAll(@Query() query: FilterUniqueProductDto) {
    return this.productItemSellerService.findAll(query);
  }

  @Auth('SELLER')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.productItemSellerService.findDetailById(+id);
  }
}
