export class UniqueProductDto {
  id: number;
  productId: number;
  productTitle: string;
  brandName: string;
  serialCode: string;
  condition: string;
  functionality: string;
  cost: number;
  salePrice: number;
  sold: boolean;
  available: boolean;
  createdAt: Date;
}
