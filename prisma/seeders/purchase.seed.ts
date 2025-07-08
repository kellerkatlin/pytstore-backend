import {
  PrismaClient,
  PurchaseItemStatus,
  CommissionType,
  Prisma,
} from '@prisma/client';

export async function seedPurchases(prisma: PrismaClient) {
  // Buscar producto simple
  const product = await prisma.product.findFirst({
    where: { title: 'iPhone 13 128GB' },
  });

  if (!product) {
    throw new Error(
      '❌ Producto simple no encontrado. Asegúrate de correr primero seedProducts.',
    );
  }
  if (!product.gainType || product.gainValue == null) {
    throw new Error('❌ Producto no tiene configuración de ganancia');
  }

  // Dinamizamos el invoiceCode para permitir múltiples compras
  const timestamp = Date.now();
  const invoiceCode = `INV-${timestamp}`;
  const purchaseDate = new Date();

  const purchase = await prisma.purchase.create({
    data: {
      providerName: 'Proveedor Apple Import',
      invoiceCode,
      purchaseDate,
      items: {
        create: [
          {
            productId: product.id,
            unitCost: 1800,
            quantity: 10,
            status: PurchaseItemStatus.RECEIVED,
            productItems: {
              createMany: {
                data: generateProductItems(
                  product.id,
                  timestamp,
                  1800,
                  product.gainType,
                  product.gainValue,
                ),
              },
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Compra registrada: ${purchase.invoiceCode}`);
}

function calculateSalePrice(
  cost: number,
  gainType: 'FIXED' | 'PERCENT',
  gainValue: number,
): number {
  if (gainType === 'PERCENT') {
    return Math.round(cost * (1 + gainValue / 100));
  }
  return cost + gainValue;
}

function generateProductItems(
  productId: number,
  batchId: number,
  unitCost: number,
  gainType: 'FIXED' | 'PERCENT',
  gainValue: number,
): Prisma.ProductItemCreateManyPurchaseItemInput[] {
  const items: Prisma.ProductItemCreateManyPurchaseItemInput[] = [];

  const salePrice = calculateSalePrice(unitCost, gainType, gainValue);

  for (let i = 1; i <= 10; i++) {
    items.push({
      serialCode: `SN-IPH13-${batchId}-${i}`,
      productId,
      gainType,
      gainValue,
      status: 'IN_STOCK',
      description: 'Producto revisado, sin rayones, excelente estado',
      salePrice,
      commissionType: CommissionType.PERCENT,
      commissionValue: 30,
      createdAt: new Date(),
    });
  }

  return items;
}
