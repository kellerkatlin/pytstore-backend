import { PrismaClient } from '@prisma/client';
import { seedSuperadmin } from './seeders/user.seeder';
import { seedRoles } from './seeders/role.seeder';
import { seedCapitalAccounts } from './seeders/capital-account.seeder';
import { seedProducts } from './seeders/products.seeder';
import { seedCustomers } from './seeders/customers.seeder';
import { seedCategoriesBrandsAttributes } from './seeders/categories_brands_attributes.seed';
import { seedPurchases } from './seeders/purchase.seed';
import { seedShippingMethods } from './seeders/shipping_methods.seed';
import { seedPaymentMethods } from './seeders/payment_methods.seed';
import { seedSales } from './seeders/sales.seed';
import { seedCommissionsAndWithdrawals } from './seeders/commisions_and_withdrawals.seed';

const prisma = new PrismaClient();

async function main() {
  const roles = await seedRoles(prisma);
  await seedSuperadmin(prisma, roles.SUPERADMIN.id);
  await seedCapitalAccounts(prisma);
  await seedCustomers(prisma);
  await seedCategoriesBrandsAttributes(prisma);
  await seedProducts(prisma);
  await seedPurchases(prisma);
  await seedShippingMethods(prisma);
  await seedPaymentMethods(prisma);
  await seedSales(prisma);
  await seedCommissionsAndWithdrawals(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
