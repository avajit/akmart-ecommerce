import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function makeSlug(name: string): string {
  return slugify(name, { lower: true, strict: true }) + '-' + nanoid(6);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // ─────────────────────────────────────────────
  // 1. ROLES
  // ─────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Platform administrator', isSystem: true },
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: { name: 'SELLER', description: 'Vendor who can manage their own shop and products', isSystem: true },
  });

  const consumerRole = await prisma.role.upsert({
    where: { name: 'CONSUMER' },
    update: {},
    create: { name: 'CONSUMER', description: 'Standard user who can buy products', isSystem: true },
  });

  console.log('✅ Roles seeded');

  // ─────────────────────────────────────────────
  // 2. PERMISSIONS
  // ─────────────────────────────────────────────
  const permissionDefs = [
    { action: 'CREATE_PRODUCT',    description: 'Can create a new product' },
    { action: 'UPDATE_PRODUCT',    description: 'Can update their own product' },
    { action: 'DELETE_PRODUCT',    description: 'Can delete their own product' },
    { action: 'DELETE_ANY_PRODUCT',description: 'Can delete any product (Admin)' },
    { action: 'APPROVE_PRODUCT',   description: 'Can approve or reject products (Admin)' },
    { action: 'UPDATE_ORDER_STATUS',description: 'Can update status of their shop orders' },
    { action: 'VIEW_ALL_ORDERS',   description: 'Can view all platform orders (Admin)' },
    { action: 'MANAGE_ROLES',      description: 'Can create or modify roles and permissions' },
    { action: 'BAN_USER',          description: 'Can ban or unban a user' },
    { action: 'VERIFY_SELLER',     description: 'Can verify a seller for payout (Admin)' },
    { action: 'MANAGE_CATEGORIES', description: 'Can create/edit/delete categories (Admin)' },
  ];

  for (const perm of permissionDefs) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      update: {},
      create: perm,
    });
  }

  // Assign all permissions to ADMIN
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Assign relevant permissions to SELLER
  const sellerPermActions = ['CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'UPDATE_ORDER_STATUS'];
  for (const action of sellerPermActions) {
    const perm = allPermissions.find(p => p.action === action)!;
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: sellerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: sellerRole.id, permissionId: perm.id },
    });
  }

  console.log('✅ Permissions seeded');

  // ─────────────────────────────────────────────
  // 3. USERS
  // ─────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@akmart.com' },
    update: {},
    create: {
      email: 'admin@akmart.com',
      fullName: 'AKMart Admin',
      passwordHash: await bcrypt.hash('Admin@123', 12),
      roleId: adminRole.id,
      isEmailVerified: true,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@techmart.com' },
    update: {},
    create: {
      email: 'seller@techmart.com',
      fullName: 'TechMart Owner',
      passwordHash: await bcrypt.hash('Seller@123', 12),
      roleId: sellerRole.id,
      isEmailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'consumer@akmart.com' },
    update: {},
    create: {
      email: 'consumer@akmart.com',
      fullName: 'Test Consumer',
      passwordHash: await bcrypt.hash('Consumer@123', 12),
      roleId: consumerRole.id,
      isEmailVerified: true,
    },
  });

  console.log('✅ Users seeded');

  // ─────────────────────────────────────────────
  // 4. BRANDS
  // ─────────────────────────────────────────────
  const samsung = await prisma.brand.upsert({
    where: { slug: 'samsung' },
    update: {},
    create: { name: 'Samsung', slug: 'samsung', logoUrl: 'https://placehold.co/100x40?text=Samsung' },
  });

  await prisma.brand.upsert({
    where: { slug: 'apple' },
    update: {},
    create: { name: 'Apple', slug: 'apple', logoUrl: 'https://placehold.co/100x40?text=Apple' },
  });

  await prisma.brand.upsert({
    where: { slug: 'nike' },
    update: {},
    create: { name: 'Nike', slug: 'nike', logoUrl: 'https://placehold.co/100x40?text=Nike' },
  });

  await prisma.brand.upsert({
    where: { slug: 'generic' },
    update: {},
    create: { name: 'Generic', slug: 'generic', logoUrl: 'https://placehold.co/100x40?text=Generic' },
  });

  console.log('✅ Brands seeded');

  // ─────────────────────────────────────────────
  // 5. CATEGORY TREE
  // ─────────────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics', imageUrl: 'https://placehold.co/200x200?text=Electronics' },
  });

  const smartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: { name: 'Smartphones', slug: 'smartphones', parentId: electronics.id, imageUrl: 'https://placehold.co/200x200?text=Smartphones' },
  });

  await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: { name: 'Laptops', slug: 'laptops', parentId: electronics.id, imageUrl: 'https://placehold.co/200x200?text=Laptops' },
  });

  await prisma.category.upsert({
    where: { slug: 'android-phones' },
    update: {},
    create: { name: 'Android Phones', slug: 'android-phones', parentId: smartphones.id },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: { name: 'Clothing', slug: 'clothing', imageUrl: 'https://placehold.co/200x200?text=Clothing' },
  });

  const mens = await prisma.category.upsert({
    where: { slug: 'mens-clothing' },
    update: {},
    create: { name: "Men's", slug: 'mens-clothing', parentId: clothing.id },
  });

  const tshirts = await prisma.category.upsert({
    where: { slug: 'mens-tshirts' },
    update: {},
    create: { name: 'T-Shirts', slug: 'mens-tshirts', parentId: mens.id },
  });

  await prisma.category.upsert({
    where: { slug: 'womens-clothing' },
    update: {},
    create: { name: "Women's", slug: 'womens-clothing', parentId: clothing.id },
  });

  const groceries = await prisma.category.upsert({
    where: { slug: 'groceries' },
    update: {},
    create: { name: 'Groceries', slug: 'groceries', imageUrl: 'https://placehold.co/200x200?text=Groceries' },
  });

  await prisma.category.upsert({
    where: { slug: 'snacks-beverages' },
    update: {},
    create: { name: 'Snacks & Beverages', slug: 'snacks-beverages', parentId: groceries.id },
  });

  await prisma.category.upsert({
    where: { slug: 'home-kitchen' },
    update: {},
    create: { name: 'Home & Kitchen', slug: 'home-kitchen', imageUrl: 'https://placehold.co/200x200?text=Home+%26+Kitchen' },
  });

  console.log('✅ Category tree seeded');

  // ─────────────────────────────────────────────
  // 6. CATEGORY ATTRIBUTE CONFIGS
  // ─────────────────────────────────────────────
  const smartphoneAttrs = [
    { key: 'color',   label: 'Color',   filterType: 'MULTISELECT' as const, unit: null,   order: 1 },
    { key: 'ram',     label: 'RAM',     filterType: 'MULTISELECT' as const, unit: 'GB',   order: 2 },
    { key: 'storage', label: 'Storage', filterType: 'MULTISELECT' as const, unit: 'GB',   order: 3 },
    { key: 'battery', label: 'Battery', filterType: 'RANGE'       as const, unit: 'mAh',  order: 4 },
    { key: 'is5g',    label: '5G',      filterType: 'BOOLEAN'     as const, unit: null,   order: 5 },
  ];

  for (const attr of smartphoneAttrs) {
    await prisma.categoryAttributeConfig.upsert({
      where: { categoryId_key: { categoryId: smartphones.id, key: attr.key } },
      update: {},
      create: { categoryId: smartphones.id, ...attr },
    });
  }

  const tshirtAttrs = [
    { key: 'color',    label: 'Color',    filterType: 'MULTISELECT' as const, unit: null, order: 1 },
    { key: 'size',     label: 'Size',     filterType: 'MULTISELECT' as const, unit: null, order: 2 },
    { key: 'material', label: 'Material', filterType: 'MULTISELECT' as const, unit: null, order: 3 },
  ];

  for (const attr of tshirtAttrs) {
    await prisma.categoryAttributeConfig.upsert({
      where: { categoryId_key: { categoryId: tshirts.id, key: attr.key } },
      update: {},
      create: { categoryId: tshirts.id, ...attr },
    });
  }

  console.log('✅ Category attribute configs seeded');

  // ─────────────────────────────────────────────
  // 7. SELLER PROFILE
  // ─────────────────────────────────────────────
  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      shopName: 'TechMart Nepal',
      shopDescription: 'Your trusted gadget store in Nepal',
      phoneNumber: '+977-9801234567',
      address: 'New Baneshwor',
      city: 'Kathmandu',
      state: 'Bagmati',
      pincode: '44600',
      country: 'NP',
      verificationStatus: 'VERIFIED',
      isPayoutEnabled: true,
    },
  });

  console.log('✅ Seller profile seeded');

  // ─────────────────────────────────────────────
  // 8. SAMPLE PRODUCT (APPROVED)
  // ─────────────────────────────────────────────
  const productSlug = 'samsung-galaxy-s24-' + nanoid(6);

  const product = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S24',
      slug: productSlug,
      description: 'The latest Samsung flagship with Snapdragon 8 Gen 3, 50MP camera, and a stunning 6.2" AMOLED display.',
      categoryId: smartphones.id,
      brandId: samsung.id,
      createdById: sellerUser.id,
      status: 'APPROVED',
    },
  });

  // Variant 1: Black / 256GB
  const variantBlack = await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'Phantom Black / 256GB',
      sku: 'SGS24-BLK-256',
      attributes: { color: 'Phantom Black', ram: '8', storage: '256', battery: '4000', is5g: true },
    },
  });

  await prisma.productImage.createMany({
    data: [
      { variantId: variantBlack.id, productId: product.id, url: 'https://placehold.co/600x600?text=S24+Black+Front', altText: 'S24 Black Front', isPrimary: true, order: 1 },
      { variantId: variantBlack.id, productId: product.id, url: 'https://placehold.co/600x600?text=S24+Black+Back', altText: 'S24 Black Back', order: 2 },
    ],
  });

  // Variant 2: Marble Gray / 128GB
  const variantGray = await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'Marble Gray / 128GB',
      sku: 'SGS24-GRY-128',
      attributes: { color: 'Marble Gray', ram: '8', storage: '128', battery: '4000', is5g: true },
    },
  });

  await prisma.productImage.createMany({
    data: [
      { variantId: variantGray.id, productId: product.id, url: 'https://placehold.co/600x600?text=S24+Gray+Front', altText: 'S24 Gray Front', isPrimary: true, order: 1 },
      { variantId: variantGray.id, productId: product.id, url: 'https://placehold.co/600x600?text=S24+Gray+Back', altText: 'S24 Gray Back', order: 2 },
    ],
  });

  console.log('✅ Sample product + variants + images seeded');

  // ─────────────────────────────────────────────
  // 9. SELLER LISTINGS
  // ─────────────────────────────────────────────
  await prisma.sellerListing.createMany({
    data: [
      {
        sellerProfileId: sellerProfile.id,
        variantId: variantBlack.id,
        price: 74999,
        mrp: 89999,
        stock: 50,
        reservedStock: 0,
        isActive: true,
      },
      {
        sellerProfileId: sellerProfile.id,
        variantId: variantGray.id,
        price: 64999,
        mrp: 79999,
        stock: 30,
        reservedStock: 0,
        isActive: true,
      },
    ],
  });

  console.log('✅ Seller listings seeded');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('─────────────────────────────────────────────');
  console.log('  Admin:    admin@akmart.com    / Admin@123');
  console.log('  Seller:   seller@techmart.com / Seller@123');
  console.log('  Consumer: consumer@akmart.com / Consumer@123');
  console.log('─────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

