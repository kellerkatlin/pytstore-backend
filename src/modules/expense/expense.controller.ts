import { Body, Controller, Get, Post } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseService } from './expense.service';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Auth('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateExpenseDto, @ActiveUser('sub') userId: number) {
    return this.service.create(dto, userId);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
