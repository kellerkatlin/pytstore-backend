import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Auth('SUPERADMIN', 'ADMIN')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  @Post()
  async create(@Body() dto: CreateBrandDto) {
    return await this.brandService.create(dto);
  }
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('sortBy') sortBy = 'id',
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    return await this.brandService.findAll(
      +page,
      +limit,
      search,
      sortBy,
      order,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.brandService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBrandDto,
  ) {
    return await this.brandService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.brandService.remove(id);
  }
}
