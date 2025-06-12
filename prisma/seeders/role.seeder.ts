import { PrismaClient, RoleName } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  const roleNames = Object.values(RoleName);

  const created: Record<RoleName, { id: number; name: RoleName }> =
    {} as Record<RoleName, { id: number; name: RoleName }>;

  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Rol ${name}`,
      },
    });

    created[name] = role;
  }

  console.log('✅ Roles sembrados');
  return created;
}
