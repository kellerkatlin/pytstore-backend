import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient) {
  const celulares = await prisma.category.upsert({
    where: { name: 'Celulares' },
    update: {},
    create: { name: 'Celulares' },
  });

  // Crear marca
  const apple = await prisma.brand.upsert({
    where: { name: 'Apple' },
    update: {},
    create: { name: 'Apple' },
  });

  // Crear atributos y valores
  const estado = await prisma.attribute.upsert({
    where: { name_categoryId: { name: 'Estado', categoryId: celulares.id } },
    update: {},
    create: {
      name: 'Estado',
      categoryId: celulares.id,
      values: {
        createMany: {
          data: [
            { value: 'Nuevo' },
            { value: 'Como nuevo' },
            { value: 'Usado' },
          ],
        },
      },
    },
  });

  const capacidad = await prisma.attribute.upsert({
    where: { name_categoryId: { name: 'Capacidad', categoryId: celulares.id } },
    update: {},
    create: {
      name: 'Capacidad',
      categoryId: celulares.id,
      values: {
        createMany: {
          data: [{ value: '128GB' }, { value: '256GB' }],
        },
      },
    },
  });

  const color = await prisma.attribute.upsert({
    where: { name_categoryId: { name: 'Color', categoryId: celulares.id } },
    update: {},
    create: {
      name: 'Color',
      categoryId: celulares.id,
      values: {
        createMany: {
          data: [{ value: 'Negro' }, { value: 'Azul' }],
        },
      },
    },
  });

  // Producto 1 (simple - sin variantes)
  const productoSimple = await prisma.product.create({
    data: {
      title: 'iPhone 13 128GB',
      description: 'iPhone 13 de segunda mano, en excelente estado.',
      price: 2500,
      stock: 10,
      categoryId: celulares.id,
      brandId: apple.id,
      isActive: true,
      isPreorder: false,
      commissionType: 'PERCENT',
      commissionValue: 30,
      status: 'ACTIVE',
      images: {
        create: [
          {
            imageUrl:
              'https://mac-center.com.pe/cdn/shop/files/iPhone_13_Midnight_PDP_Image_position-1A__CLCO_v1_83f068d3-1619-4e81-8f3a-cfb7d7ff73af.jpg?v=1700286900&width=823',
            isPrimary: true,
          },
          {
            imageUrl:
              'https://mac-center.com.pe/cdn/shop/files/iPhone_13_Midnight_PDP_Image_position-1A__CLCO_v1_83f068d3-1619-4e81-8f3a-cfb7d7ff73af.jpg?v=1700286900&width=823',
          },
        ],
      },
      attributes: {
        create: [
          {
            attributeId: estado.id,
            valueId: (await prisma.attributeValue.findFirst({
              where: { value: 'Como nuevo', attributeId: estado.id },
            }))!.id,
          },
        ],
      },
    },
  });

  // Simular compra (purchase)
  await prisma.purchase.create({
    data: {
      providerName: 'Proveedor X',
      invoiceCode: 'INV-001',
      purchaseDate: new Date(),
      items: {
        create: [
          {
            productId: productoSimple.id,
            unitCost: 1800,
            quantity: 10,
            status: 'RECEIVED',
            productItems: {
              createMany: {
                data: [...Array(10).keys()].map((idx) => ({
                  serialCode: `SN-IPH13-${idx + 1}`,
                  productId: productoSimple.id,
                  condition: 'Como nuevo',
                  functionality: '100% operativa',
                  available: true,
                  cost: 1800,
                  salePrice: 2500,
                  sold: false,
                  createdAt: new Date(),
                })),
              },
            },
          },
        ],
      },
    },
  });

  // Producto 2 (con variantes)
  const productoConVariantes = await prisma.product.create({
    data: {
      title: 'iPhone 14',
      description: 'iPhone 14 nuevos en diferentes capacidades y colores.',
      price: 3500,
      stock: 0,
      categoryId: celulares.id,
      brandId: apple.id,
      isActive: true,
      isPreorder: false,
      commissionType: 'PERCENT',
      commissionValue: 30,
      status: 'ACTIVE',
      images: {
        create: [
          {
            imageUrl:
              'https://mac-center.com.pe/cdn/shop/files/iPhone_13_Midnight_PDP_Image_position-1A__CLCO_v1_83f068d3-1619-4e81-8f3a-cfb7d7ff73af.jpg?v=1700286900&width=823',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Crear variantes
  await prisma.productVariant.create({
    data: {
      productId: productoConVariantes.id,
      sku: 'IPH14-128GB-AZUL',
      price: 3500,
      stock: 5,
      isActive: true,
      imageUrl:
        'https://mac-center.com.pe/cdn/shop/files/iPhone_13_Midnight_PDP_Image_position-1A__CLCO_v1_83f068d3-1619-4e81-8f3a-cfb7d7ff73af.jpg?v=1700286900&width=823',
      attributes: {
        create: [
          {
            attributeId: capacidad.id,
            valueId: (await prisma.attributeValue.findFirst({
              where: { value: '128GB', attributeId: capacidad.id },
            }))!.id,
          },
          {
            attributeId: color.id,
            valueId: (await prisma.attributeValue.findFirst({
              where: { value: 'Azul', attributeId: color.id },
            }))!.id,
          },
        ],
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: productoConVariantes.id,
      sku: 'IPH14-256GB-NEGRO',
      price: 3900,
      stock: 3,
      isActive: true,
      imageUrl:
        'https://mac-center.com.pe/cdn/shop/files/iPhone_13_Midnight_PDP_Image_position-1A__CLCO_v1_83f068d3-1619-4e81-8f3a-cfb7d7ff73af.jpg?v=1700286900&width=823',
      attributes: {
        create: [
          {
            attributeId: capacidad.id,
            valueId: (await prisma.attributeValue.findFirst({
              where: { value: '256GB', attributeId: capacidad.id },
            }))!.id,
          },
          {
            attributeId: color.id,
            valueId: (await prisma.attributeValue.findFirst({
              where: { value: 'Negro', attributeId: color.id },
            }))!.id,
          },
        ],
      },
    },
  });

  console.log('✅ Datos de prueba cargados correctamente.');
}
