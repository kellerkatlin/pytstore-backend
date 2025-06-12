import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedSuperadmin(prisma: PrismaClient, roleId: number) {
  const email = 'kellerkatlin.k@gmail.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return console.log(`ℹ️ SUPERADMIN ya existe: ${email}`);

  const password = await bcrypt.hash('keller123', 10);

  await prisma.user.create({
    data: {
      name: 'Keller',
      email,
      password,
      referralCode: 'superadmin-001',
      roleId,
    },
  });

  console.log(`✅ Usuario SUPERADMIN creado: ${email}`);
}
