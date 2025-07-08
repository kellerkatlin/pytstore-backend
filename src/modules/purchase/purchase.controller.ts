import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreatePurchaseProductUniqueDto } from './dto/create-purchase-product-unique.dto';

@Auth('SUPERADMIN', 'ADMIN', 'STOCK')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly service: PurchaseService) {}

  // @Post()
  // async create(@Body() dto: CreatePurchaseDto) {
  //   const result = await this.service.create(dto);
  //   return created(result, 'Compra registrada correctamente');
  // }

  @Post()
  async createPurchaseProductUnique(
    @Body() dto: CreatePurchaseProductUniqueDto,
  ) {
    return await this.service.createForUniqueItems(dto);
  }

  @Patch(':id/confirm')
  async confirmProductItemArrival(@Param('id', ParseIntPipe) id: number) {
    return this.service.confirmProductItemArrival(id);
  }
}
