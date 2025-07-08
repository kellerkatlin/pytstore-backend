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
import { WithdrawalService } from './withdrawal.service';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { JwtPayload } from '../auth/dto/jwt-payload.dto';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';

@Controller('withdrawal')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  // Vendedor: solicitar retiro
  @Auth('SELLER')
  @Post()
  async requestWithdrawal(
    @ActiveUser() user: JwtPayload,
    @Body() dto: CreateWithdrawalRequestDto,
  ) {
    return this.withdrawalService.requestWithdrawal(user.sub, dto);
  }

  // Vendedor: ver sus propios retiros
  @Auth('SELLER')
  @Get('my')
  async getMyWithdrawals(
    @ActiveUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.withdrawalService.getMyWithdrawals(
      user.sub,
      +page,
      +limit,
      startDate,
      endDate,
    );
  }

  // Admin: cambiar estado de solicitud
  @Auth('SUPERADMIN', 'ADMIN')
  @Patch(':id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWithdrawalStatusDto,
  ) {
    return this.withdrawalService.updateStatus(id, dto);
  }

  // Admin: ver todos los retiros
  @Auth('SUPERADMIN', 'ADMIN')
  @Get()
  async getAllForAdmin(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.withdrawalService.getAllForAdmin(
      +page,
      +limit,
      startDate,
      endDate,
    );
  }
}
