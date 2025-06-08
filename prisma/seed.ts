import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const superadminRole = await prisma.role.upsert({
    where: { name: 'SUPERADMIN' },
    update: {},
    create: {
      name: 'SUPERADMIN',
      description: 'Superusuario con acceso total',
    },
  });

  const existingUser = await prisma.user.findUnique({
    where: { email: 'kellerkatlin.k@gmail.com' },
  });

  if (existingUser) {
    console.log('✅ El usuario superadmin ya existe');
    return;
  }

  const hashedPassword = await bcrypt.hash('keller123', 10);

  await prisma.user.create({
    data: {
      name: 'Keller',
      email: 'kellerkatlin.k@gmail.com',
      password: hashedPassword,
      referralCode: 'superadmin-001', // Puedes usar uuid() si deseas
      role: {
        connect: { id: superadminRole.id },
      },
    },
  });

  console.log('✅ Superadmin creado correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
