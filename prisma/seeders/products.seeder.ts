import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient) {
  // Buscar categoría y marca previamente creadas
  const category = await prisma.category.findUnique({
    where: { name: 'Celulares' },
  });

  const brand = await prisma.brand.findUnique({
    where: { name: 'Apple' },
  });

  if (!category || !brand) {
    throw new Error(
      '❌ Categoría o Marca no encontradas. Asegúrate de correr los seeders anteriores.',
    );
  }

  // Buscar atributos globales
  const [estado, capacidad, color] = await Promise.all([
    prisma.attribute.findUnique({ where: { name: 'Estado' } }),
    prisma.attribute.findUnique({ where: { name: 'Capacidad' } }),
    prisma.attribute.findUnique({ where: { name: 'Color' } }),
  ]);

  if (!estado || !capacidad || !color) {
    throw new Error('❌ Atributos no encontrados.');
  }

  // Producto 1: Simple (único)
  const productoSimple = await prisma.product.create({
    data: {
      title: 'iPhone 13 128GB',
      description: 'iPhone 13 de segunda mano, en excelente estado.',
      categoryId: category.id,
      brandId: brand.id,
      isActive: true,
      taxType: 'GRAVADO',
      gainType: 'PERCENT',
      gainValue: 30,
      isPreorder: false,
      commissionType: 'PERCENT',
      commissionValue: 30,
      status: 'ACTIVE',
      images: {
        create: [
          {
            imageUrl: 'https://example.com/iphone13-frontal.jpg',
            isPrimary: true,
          },
          {
            imageUrl: 'https://example.com/iphone13-lateral.jpg',
          },
        ],
      },
    },
  });

  const estadoValue = await prisma.attributeValue.findFirst({
    where: { value: 'Como nuevo', attributeId: estado.id },
  });

  if (estadoValue) {
    await prisma.productAttribute.create({
      data: {
        productId: productoSimple.id,
        attributeId: estado.id,
        values: {
          create: [{ valueId: estadoValue.id }],
        },
      },
    });
  }

  // Producto 2: Con variantes
  const productoVariantes = await prisma.product.create({
    data: {
      title: 'iPhone 14',
      description: 'iPhone 14 nuevo, diferentes colores y capacidades.',
      categoryId: category.id,
      brandId: brand.id,
      gainType: 'PERCENT',
      gainValue: 30,
      isActive: true,
      isPreorder: false,
      commissionType: 'PERCENT',
      commissionValue: 30,
      status: 'ACTIVE',
      images: {
        create: [
          {
            imageUrl: 'https://example.com/iphone14-frontal.jpg',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Asignar atributos y valores válidos al producto base (para variantes)
  const capacidadValues = await prisma.attributeValue.findMany({
    where: {
      attributeId: capacidad.id,
      value: { in: ['128GB', '256GB', '512GB'] },
    },
    select: { id: true },
  });

  await prisma.productAttribute.create({
    data: {
      productId: productoVariantes.id,
      attributeId: capacidad.id,
      values: {
        create: capacidadValues.map((v) => ({ valueId: v.id })),
      },
    },
  });

  const colorValues = await prisma.attributeValue.findMany({
    where: {
      attributeId: color.id,
      value: { in: ['Negro', 'Azul', 'Rojo'] },
    },
    select: { id: true },
  });

  await prisma.productAttribute.create({
    data: {
      productId: productoVariantes.id,
      attributeId: color.id,
      values: {
        create: colorValues.map((v) => ({ valueId: v.id })),
      },
    },
  });

  // Variantes
  const variantesData = [
    {
      sku: 'IPH14-128GB-NEGRO',
      capacidad: '128GB',
      color: 'Negro',
      price: 3500,
      stock: 10,
    },
    {
      sku: 'IPH14-256GB-AZUL',
      capacidad: '256GB',
      color: 'Azul',
      price: 3800,
      stock: 5,
    },
    {
      sku: 'IPH14-512GB-ROJO',
      capacidad: '512GB',
      color: 'Rojo',
      price: 4200,
      stock: 3,
    },
  ];

  for (const variante of variantesData) {
    const capacidadValue = await prisma.attributeValue.findFirst({
      where: { value: variante.capacidad, attributeId: capacidad.id },
    });

    const colorValue = await prisma.attributeValue.findFirst({
      where: { value: variante.color, attributeId: color.id },
    });

    if (!capacidadValue || !colorValue) {
      console.warn(
        `⚠️ Atributos no encontrados para la variante: ${variante.sku}`,
      );
      continue;
    }

    await prisma.productVariant.create({
      data: {
        productId: productoVariantes.id,
        sku: variante.sku,
        price: variante.price,
        stock: variante.stock,
        status: 'ACTIVE',
        attributes: {
          create: [
            {
              attributeId: capacidad.id,
              valueId: capacidadValue.id,
            },
            {
              attributeId: color.id,
              valueId: colorValue.id,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Productos y variantes sembrados correctamente.');
}
