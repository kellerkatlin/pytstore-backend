import { PrismaClient, CapitalAccountName } from '@prisma/client';

export async function seedCapitalAccounts(prisma: PrismaClient) {
  const accounts = [
    {
      name: CapitalAccountName.CASH,
      description: 'Dinero líquido disponible (efectivo o bancos)',
    },
    {
      name: CapitalAccountName.INVENTORY,
      description: 'Valor de productos comprados aún no vendidos',
    },
    {
      name: CapitalAccountName.PROFITS,
      description: 'Ganancias netas acumuladas',
    },
    {
      name: CapitalAccountName.COMMISSIONS,
      description: 'Comisiones generadas para vendedores',
    },
  ];

  for (const acc of accounts) {
    await prisma.capitalAccount.upsert({
      where: { name: acc.name },
      update: {},
      create: acc,
    });
  }

  console.log('✅ Cuentas de capital sembradas');
}
