import { ProductCondition } from '@prisma/client';

export class UniqueProductDto {
  id: number;
  productId: number;
  productTitle: string;
  brandName: string;
  serialCode: string;
  condition: ProductCondition;
  functionality: string;
  cost: number;
  salePrice: number;
  sold: boolean;
  createdAt: Date;
}
