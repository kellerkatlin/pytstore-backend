import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { VariantAttributeService } from './variant-attribute.service';
import { CreateVariantAttributeDto } from './dto/create-variant-attribute.dto';

@Auth('SUPERADMIN', 'ADMIN')
@Controller('variant-attribute')
export class VariantAttributeController {
  constructor(private readonly service: VariantAttributeService) {}

  @Post()
  assign(@Body() dto: CreateVariantAttributeDto) {
    return this.service.assign(dto);
  }

  @Get(':variantId')
  findByVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.service.findByVariant(variantId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
