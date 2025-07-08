import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { FilterCommissionDto } from './dto/filter-commission.dto';
import { ok } from 'src/common/helpers/response.helper';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { CommissionService } from './commission.service';
import { JwtPayload } from '../auth/dto/jwt-payload.dto';

@Controller('commission')
export class CommissionController {
  constructor(private readonly service: CommissionService) {}

  @Auth('SELLER')
  @Get()
  async getMyCommissions(
    @ActiveUser('sub') userId: number,
    @Query() query: FilterCommissionDto,
  ) {
    const data = await this.service.findAllByUser(userId, query);
    return ok(data, 'Comisiones del usuario');
  }

  @Auth('SELLER')
  @Get('total')
  async getMyEarnings(@ActiveUser('sub') userId: number) {
    const total = await this.service.getTotalEarnings(userId);
    return ok({ total }, 'Total de comisiones pagadas');
  }

  @Auth('SELLER')
  @Get('summary')
  async getMySummary(@ActiveUser() user: JwtPayload) {
    return this.service.getSummary(user.sub);
  }
}
