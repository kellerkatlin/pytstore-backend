import { PrismaClient } from '@prisma/client';

export async function seedCategoriesBrandsAttributes(prisma: PrismaClient) {
  // Crear Categoría
  await prisma.category.upsert({
    where: { name: 'Celulares' },
    update: {},
    create: { name: 'Celulares' },
  });

  // Crear Marcas
  await prisma.brand.upsert({
    where: { name: 'Apple' },
    update: {},
    create: { name: 'Apple' },
  });

  await prisma.brand.upsert({
    where: { name: 'Samsung' },
    update: {},
    create: { name: 'Samsung' },
  });

  // Crear atributos globales con sus valores
  const createAttributeWithValues = async (name: string, values: string[]) => {
    await prisma.attribute.upsert({
      where: { name },
      update: {},
      create: {
        name,
        values: {
          createMany: {
            data: values.map((v) => ({ value: v })),
          },
        },
      },
    });
  };

  await createAttributeWithValues('Estado', ['Nuevo', 'Como nuevo', 'Usado']);
  await createAttributeWithValues('Capacidad', ['128GB', '256GB', '512GB']);
  await createAttributeWithValues('Color', ['Negro', 'Azul', 'Rojo']);

  console.log('✅ Categorías, Marcas y Atributos sembrados correctamente.');
}
