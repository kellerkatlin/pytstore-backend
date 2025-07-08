import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleService } from './sale.service';
import { JwtPayload } from '../auth/dto/jwt-payload.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { FilterSaleDto } from './dto/filter-sale.dto';
import { SearchSaleItemsDto } from './dto/search-sale-items.dto';
import { PaySaleDto } from './dto/pay-sale.dto';
import { ApproveSaleDto } from './dto/approve-sale.dto';

@Controller('sale')
export class SaleController {
  constructor(private readonly service: SaleService) {}

  @Get()
  @Auth('SUPERADMIN', 'ADMIN')
  async findAll(@ActiveUser() user: JwtPayload, @Query() query: FilterSaleDto) {
    return this.service.findAll(user, query);
  }

  @Get('items/search')
  @Auth('SUPERADMIN', 'ADMIN')
  async searchItems(@Query() query: SearchSaleItemsDto) {
    return this.service.searchItems(query);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }

  // Venta interna (panel del vendedor o admin)
  @Post()
  @Auth('SUPERADMIN', 'ADMIN')
  create(@Body() dto: CreateSaleDto) {
    return this.service.create(dto);
  }

  // Venta pública con código de referido
  @Post('ref/:referralCode')
  createWithReferral(
    @Param('referralCode') referralCode: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.service.create({ ...dto, referralCode });
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Patch(':id/approve')
  async approveSale(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveSaleDto,
  ) {
    return this.service.approveSale(id, dto);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Patch(':id/reject')
  async rejectSale(@Param('id', ParseIntPipe) id: number) {
    return this.service.rejectSale(id);
  }
  @Auth('SUPERADMIN')
  @Patch(':id/pay')
  async paySale(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PaySaleDto,
    @ActiveUser() user: JwtPayload,
  ) {
    return this.service.paySale(id, dto, user);
  }

  @Auth('SUPERADMIN')
  @Patch(':id/prepare')
  async prepareSale(@Param('id', ParseIntPipe) id: number) {
    return this.service.prepareSale(id);
  }

  @Auth('SUPERADMIN')
  @Patch(':id/complete')
  async completeSale(@Param('id', ParseIntPipe) id: number) {
    return this.service.completeSale(id);
  }
}
