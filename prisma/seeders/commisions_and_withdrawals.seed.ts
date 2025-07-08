import {
  PrismaClient,
  CommissionStatus,
  WithdrawalStatus,
} from '@prisma/client';

export async function seedCommissionsAndWithdrawals(prisma: PrismaClient) {
  // Buscamos ventas completadas que aún no tengan comisión
  const sales = await prisma.sale.findMany({
    where: {
      status: 'COMPLETED',
      commission: null,
    },
    take: 3, // vamos a simular 3 para la prueba
  });

  if (sales.length === 0) {
    console.log('⚠️ No hay ventas disponibles para asignar comisión.');
    return;
  }

  for (const sale of sales) {
    // Buscamos un usuario vendedor (por ahora simple)
    const user = await prisma.user.findFirst({
      where: { isActive: true },
    });

    if (!user) {
      throw new Error('❌ No hay usuario vendedor registrado.');
    }

    const commissionAmount = (sale.salePrice * 30) / 100;

    const commission = await prisma.commission.create({
      data: {
        saleId: sale.id,
        userId: user.id,
        amount: commissionAmount,
        status: CommissionStatus.PENDING,
      },
    });

    console.log(
      `✅ Comisión creada ID: ${commission.id} | Venta ID: ${sale.id}`,
    );

    // Simular una solicitud de retiro por la mitad de la comisión
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId: user.id,
        amount: commissionAmount / 2,
        status: WithdrawalStatus.PENDING,
      },
    });

    console.log(`✅ Withdrawal solicitado ID: ${withdrawal.id}`);
  }
}
