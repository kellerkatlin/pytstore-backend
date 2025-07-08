import { PrismaClient, ShippingType, ShippingPayer } from '@prisma/client';

export async function seedShippingMethods(prisma: PrismaClient) {
  const shippingMethodsData = [
    {
      name: 'Envío estándar',
      description: 'Entrega regular en 3-5 días',
      shippingType: ShippingType.STANDARD,
      paidBy: ShippingPayer.CUSTOMER,
    },
    {
      name: 'Envío express',
      description: 'Entrega rápida en 1-2 días',
      shippingType: ShippingType.EXPRESS,
      paidBy: ShippingPayer.CUSTOMER,
    },
    {
      name: 'Entrega local',
      description: 'Recojo en tienda o despacho local',
      shippingType: ShippingType.LOCAL,
      paidBy: ShippingPayer.COMPANY,
    },
  ];

  for (const data of shippingMethodsData) {
    await prisma.shippingMethod.upsert({
      where: { name: data.name },
      update: {},
      create: {
        name: data.name,
        paidBy: data.paidBy,
        shippingType: data.shippingType,
        description: data.description,
        shipments: {}, // No agregamos relaciones aquí, solo métodos
        isActive: true,
      },
    });
  }

  console.log('✅ Métodos de envío sembrados correctamente.');
}
