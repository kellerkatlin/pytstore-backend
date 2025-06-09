import { Body, Controller, Post } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { created } from 'src/common/helpers/response.helper';
import { Auth } from '../auth/decorators/auth.decorator';

@Auth('SUPERADMIN', 'ADMIN', 'STOCK')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly service: PurchaseService) {}

  @Post()
  async create(@Body() dto: CreatePurchaseDto) {
    const result = await this.service.create(dto);
    return created(result, 'Compra registrada correctamente');
  }
}
