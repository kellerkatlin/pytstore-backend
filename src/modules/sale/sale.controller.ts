import {
  Body,
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleService } from './sale.service';

@Controller('sale')
export class SaleController {
  constructor(private readonly service: SaleService) {}

  // Venta interna (panel del vendedor o admin)
  @Post()
  @Auth('SUPERADMIN', 'ADMIN', 'SELLER')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() dto: CreateSaleDto) {
    return this.service.create(dto);
  }

  // Venta pública con código de referido
  @Post('ref/:referralCode')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  createWithReferral(
    @Param('referralCode') referralCode: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.service.create({ ...dto, referralCode });
  }
}
