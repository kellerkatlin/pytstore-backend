import { PartialType } from '@nestjs/mapped-types';
import { CreateProductItemCostDto } from './create-product-item-cost.dto';

export class UpdateProductItemCostDto extends PartialType(
  CreateProductItemCostDto,
) {}
