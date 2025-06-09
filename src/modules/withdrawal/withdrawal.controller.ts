import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
  requestWithdrawal(
    @ActiveUser() user: JwtPayload,
    @Body() dto: CreateWithdrawalRequestDto,
  ) {
    return this.withdrawalService.requestWithdrawal(user.sub, dto);
  }

  // Vendedor: ver sus propios retiros
  @Auth('SELLER')
  @Get('my')
  getMyWithdrawals(@ActiveUser() user: JwtPayload) {
    return this.withdrawalService.getMyWithdrawals(user.sub);
  }

  // Admin: cambiar estado de solicitud
  @Auth('SUPERADMIN', 'ADMIN')
  @Patch(':id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWithdrawalStatusDto,
  ) {
    return this.withdrawalService.updateStatus(id, dto);
  }

  // Admin: ver todos los retiros
  @Auth('SUPERADMIN', 'ADMIN')
  @Get()
  getAllForAdmin() {
    return this.withdrawalService.getAllForAdmin();
  }
}
