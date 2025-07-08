import {
  PrismaClient,
  SalesStatus,
  SaleType,
  PaymentStatus,
} from '@prisma/client';

export async function seedSales(prisma: PrismaClient) {
  const customer = await prisma.customer.findFirst();
  if (!customer) throw new Error('❌ No hay customers registrados.');

  const productItem = await prisma.productItem.findFirst({
    where: {
      status: 'IN_STOCK',
      salePrice: { not: null },
    },
    include: { product: true, purchaseItem: true },
  });
  if (!productItem)
    throw new Error('❌ No hay ProductItems con salePrice disponibles.');

  const user = await prisma.user.findFirst();
  if (!user) throw new Error('❌ No hay usuarios registrados.');

  const costUnit = productItem.purchaseItem?.unitCost ?? 0;
  const salePrice = productItem.salePrice!;
  const quantity = 1;
  const isGravado = productItem.taxType === 'GRAVADO';

  const total = salePrice * quantity;
  const igvRate = 0.18;
  const base = isGravado ? total / (1 + igvRate) : total;
  const igv = total - base;
  const cost = costUnit * quantity;
  const profit = total - cost;

  const sale = await prisma.sale.create({
    data: {
      customerId: customer.id,
      userId: user.id,
      salePrice: total,
      totalAmount: total,
      subtotal: base,
      igvAmount: igv,
      costTotal: cost,
      profitTotal: profit,
      status: SalesStatus.COMPLETED,
      type: SaleType.REGULAR,
      commissionBasedOnProfit: false,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  await prisma.saleItem.create({
    data: {
      saleId: sale.id,
      productId: productItem.productId,
      productItemId: productItem.id,
      purchaseItemId: productItem.purchaseItem?.id ?? null,
      quantity,
      unitPrice: salePrice,
      totalPrice: total,
      costUnit,
      costTotal: cost,
      profitTotal: profit,
    },
  });

  await prisma.productItem.update({
    where: { id: productItem.id },
    data: { status: 'SOLD' },
  });

  console.log(`✅ Venta registrada ID: ${sale.id}`);

  const paymentMethod = await prisma.paymentMethod.findFirst();
  if (!paymentMethod) throw new Error('❌ No hay métodos de pago registrados.');

  await prisma.payment.create({
    data: {
      saleId: sale.id,
      paymentMethodId: paymentMethod.id,
      totalPaid: total,
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    },
  });

  console.log(`✅ Pago registrado para la venta ID: ${sale.id}`);

  const shippingMethod = await prisma.shippingMethod.findFirst();
  if (!shippingMethod)
    throw new Error('❌ No hay métodos de envío registrados.');

  await prisma.shipment.create({
    data: {
      saleId: sale.id,
      trackingCode: `TRK-${sale.id}`,
      carrier: 'Serpost',
      shippingCost: 20,
      shippingMethodId: shippingMethod.id,
      shippingType: shippingMethod.shippingType,
      paidBy: shippingMethod.paidBy,
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  });

  console.log(`✅ Envío registrado para la venta ID: ${sale.id}`);
}
