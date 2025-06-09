import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ok } from 'src/common/helpers/response.helper';
import { StockService } from 'src/common/services/stock/stock.service';

@Auth('SUPERADMIN', 'ADMIN', 'STOCK')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly service: InventoryService,
    private readonly stockService: StockService,
  ) {}

  @Post()
  create(@Body() dto: CreateInventoryMovementDto) {
    return this.service.create(dto);
  }

  @Get(':productId')
  findByProduct(@Param('productId', ParseIntPipe) id: number) {
    return this.service.findByProduct(id);
  }
  @Get(':id/stock')
  async getStock(@Param('id', ParseIntPipe) id: number) {
    return ok(
      {
        productId: id,
        totalStock: await this.stockService.getTotalStock(id),
      },
      'Stock total obtenido correctamente',
    );
  }
}
