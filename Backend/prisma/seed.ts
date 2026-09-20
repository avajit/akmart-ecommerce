import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Core Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Master role with all permissions',
      isSystem: true,
    },
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: {
      name: 'SELLER',
      description: 'Vendor who can manage their own shop and products',
      isSystem: true,
    },
  });

  const consumerRole = await prisma.role.upsert({
    where: { name: 'CONSUMER' },
    update: {},
    create: {
      name: 'CONSUMER',
      description: 'Standard user who can buy products',
      isSystem: true,
    },
  });

  // 2. Create Core Permissions
  const permissions = [
    // Product Permissions
    { action: 'CREATE_PRODUCT', description: 'Can create a new product' },
    { action: 'UPDATE_PRODUCT', description: 'Can update their own product' },
    { action: 'DELETE_PRODUCT', description: 'Can delete their own product' },
    { action: 'DELETE_ANY_PRODUCT', description: 'Can delete any product (Admin)' },
    
    // Order Permissions
    { action: 'UPDATE_ORDER_STATUS', description: 'Can update status of their shop orders' },
    { action: 'VIEW_ALL_ORDERS', description: 'Can view all platform orders (Admin)' },
    
    // Role Permissions
    { action: 'MANAGE_ROLES', description: 'Can create or modify roles and permissions' },
    { action: 'BAN_USER', description: 'Can ban or unban a user' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      update: {},
      create: perm,
    });
  }

  // 3. Assign All Permissions to SUPER_ADMIN
  const allPermissions = await prisma.permission.findMany();
  
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
