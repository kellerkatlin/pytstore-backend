import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

export async function seedCustomers(prisma: PrismaClient) {
  for (let i = 1; i <= 3; i++) {
    const email = `customer${i}@test.com`;
    const phone = `90000000${i}`;
    const password = await bcrypt.hash('customer123', 10);

    const customer = await prisma.customer.upsert({
      where: { email },
      update: {},
      create: {
        name: `Customer ${i}`,
        email,
        phone,
        password,
        addresses: {
          createMany: {
            data: generateAddresses(i),
          },
        },
      },
    });

    console.log(`✅ Customer creado: ${customer.email}`);
  }
}

function generateAddresses(customerIndex: number) {
  const count = faker.number.int({ min: 1, max: 2 });

  const addresses: {
    addressLine: string;
    district: string;
    department: string;
    province: string;
    reference: string;
    phone: string;
  }[] = [];

  for (let j = 1; j <= count; j++) {
    addresses.push({
      addressLine: `Direccion ${j} Cliente ${customerIndex}`,
      district: 'Miraflores',
      department: 'Lima',
      province: 'Jesus Maria',
      reference: 'atras de embajada de belgica',
      phone: `900000${customerIndex}${j}`,
    });
  }
  return addresses;
}
