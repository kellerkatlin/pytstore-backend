import { PrismaClient } from '@prisma/client';
import { seedSuperadmin } from './seeders/user.seeder';
import { seedRoles } from './seeders/role.seeder';
import { seedCapitalAccounts } from './seeders/capital-account.seeder';
import { seedProducts } from './seeders/products.seeder';

const prisma = new PrismaClient();

async function main() {
  const roles = await seedRoles(prisma);
  await seedSuperadmin(prisma, roles.SUPERADMIN.id);
  await seedCapitalAccounts(prisma);
  await seedProducts(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
