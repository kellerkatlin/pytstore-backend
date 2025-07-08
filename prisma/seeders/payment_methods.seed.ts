import { PrismaClient } from '@prisma/client';

export async function seedPaymentMethods(prisma: PrismaClient) {
  const paymentMethodsData = [
    {
      name: 'Transferencia',
      supportsInstallments: false,
    },
    {
      name: 'Yape',
      supportsInstallments: false,
    },
    {
      name: 'Plin',
      supportsInstallments: false,
    },
    {
      name: 'Tarjeta de crédito',
      supportsInstallments: true,
    },
    {
      name: 'Pago en cuotas sin intereses',
      supportsInstallments: true,
    },
  ];

  for (const data of paymentMethodsData) {
    await prisma.paymentMethod.upsert({
      where: { name: data.name },
      update: {},
      create: {
        name: data.name,
        supportsInstallments: data.supportsInstallments,
        isActive: true,
      },
    });
  }

  console.log('✅ Métodos de pago sembrados correctamente.');
}
