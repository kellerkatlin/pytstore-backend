import { IsInt, IsString, Min, IsEnum } from 'class-validator';
import {
  InventoryMovementDirection,
  InventoryMovementSourceType,
} from '@prisma/client';

export class CreateInventoryMovementDto {
  @IsInt()
  productId: number;

  @IsEnum(InventoryMovementDirection)
  direction: InventoryMovementDirection;

  @IsEnum(InventoryMovementSourceType)
  sourceType: InventoryMovementSourceType;

  @IsInt()
  sourceId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  reason: string;
}
