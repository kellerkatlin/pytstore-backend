import { Body, Controller, Post } from '@nestjs/common';
import { CapitalTransferService } from './capital-transfer.service';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('capital-transfer')
export class CapitalTransferController {
  constructor(private readonly service: CapitalTransferService) {}
  @Auth('SUPERADMIN')
  @Post()
  transfer(@Body() dto: CreateTransferDto) {
    return this.service.transfer(dto);
  }
}
