import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive marketplace database seed...');

  // 1. ROLES
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

  // 2. USERS
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
      fullName: 'TechMart & Style Vendor',
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

  // 3. BRANDS
  const brandsData = [
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Apple', slug: 'apple' },
    { name: 'Nike', slug: 'nike' },
    { name: 'Zara', slug: 'zara' },
    { name: 'Sony', slug: 'sony' },
    { name: 'IKEA', slug: 'ikea' },
    { name: 'Lakme', slug: 'lakme' },
    { name: 'Generic', slug: 'generic' },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug, logoUrl: `https://placehold.co/100x40?text=${b.name}` },
    });
    brandMap[b.slug] = brand.id;
  }

  // 4. CATEGORIES (Men, Women, Kids, Home, Beauty, Electronics)
  const categoriesData = [
    { name: 'Men', slug: 'men', children: ['Clothing', 'Footwear', 'Accessories'] },
    { name: 'Women', slug: 'women', children: ['Clothing', 'Footwear', 'Handbags', 'Beauty'] },
    { name: 'Kids', slug: 'kids', children: ['Boys Clothing', 'Girls Clothing', 'Toys & Footwear'] },
    { name: 'Home', slug: 'home', children: ['Decor', 'Kitchenware', 'Bedding'] },
    { name: 'Beauty', slug: 'beauty', children: ['Skincare', 'Makeup', 'Fragrances'] },
    { name: 'Electronics', slug: 'electronics', children: ['Smartphones', 'Laptops', 'Audio'] },
  ];

  const categoryMap: Record<string, string> = {};

  for (const parentCat of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { slug: parentCat.slug },
      update: {},
      create: { name: parentCat.name, slug: parentCat.slug, imageUrl: `https://placehold.co/200x200?text=${parentCat.name}` },
    });
    categoryMap[parentCat.slug] = parent.id;

    for (const childName of parentCat.children) {
      const childSlug = slugify(childName, { lower: true, strict: true });
      const child = await prisma.category.upsert({
        where: { slug: childSlug },
        update: {},
        create: { name: childName, slug: childSlug, parentId: parent.id },
      });
      categoryMap[childSlug] = child.id;
    }
  }

  // 5. SELLER PROFILE
  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      shopName: 'AkMart Official Hub',
      shopDescription: 'Verified multi-category official store',
      phoneNumber: '+977-9801234567',
      address: 'Durbar Marg',
      city: 'Kathmandu',
      state: 'Bagmati',
      pincode: '44600',
      country: 'NP',
      verificationStatus: 'VERIFIED',
      isPayoutEnabled: true,
    },
  });

  // 6. RICH PRODUCTS WITH MATCHING IMAGES & PRICES
  const sampleProducts = [
    {
      name: 'Classic Leather Bomber Jacket',
      category: 'clothing',
      brand: 'zara',
      price: 6999,
      mrp: 9999,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
      desc: 'Premium black leather jacket designed for ultimate comfort and timeless style.',
      variants: ['Black / M', 'Black / L']
    },
    {
      name: 'Nike Air Max Runner Sneakers',
      category: 'footwear',
      brand: 'nike',
      price: 12499,
      mrp: 15999,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      desc: 'Lightweight cushioning and sleek athletic design for everyday performance.',
      variants: ['Red / US 9', 'Red / US 10']
    },
    {
      name: 'Floral Summer Wrap Dress',
      category: 'clothing',
      brand: 'zara',
      price: 4499,
      mrp: 5999,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
      desc: 'Breezy floral wrap dress perfect for sunny days and casual outings.',
      variants: ['Floral Blue / S', 'Floral Blue / M']
    },
    {
      name: 'Designer Leather Tote Bag',
      category: 'handbags',
      brand: 'zara',
      price: 8999,
      mrp: 11999,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
      desc: 'Spacious handcrafted leather tote with multiple compartments.',
      variants: ['Tan Brown', 'Jet Black']
    },
    {
      name: 'Apple MacBook Pro M3 14"',
      category: 'laptops',
      brand: 'apple',
      price: 215000,
      mrp: 235000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
      desc: 'Supercharged by M3 chip for exceptional pro workflows and stunning Liquid Retina XDR display.',
      variants: ['Space Gray / 16GB / 512GB']
    },
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      category: 'audio',
      brand: 'sony',
      price: 42999,
      mrp: 49999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      desc: 'Industry-leading noise canceling with two processors and 8 microphones.',
      variants: ['Silver', 'Midnight Black']
    },
    {
      name: 'Minimalist Ceramic Table Lamp',
      category: 'decor',
      brand: 'ikea',
      price: 3499,
      mrp: 4999,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
      desc: 'Elegant ambient lighting crafted from matte ceramic and warm brass accents.',
      variants: ['Warm White']
    },
    {
      name: 'Matte Luxury Lipstick Set',
      category: 'makeup',
      brand: 'lakme',
      price: 2299,
      mrp: 2999,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop',
      desc: 'Long-lasting velvety matte finish infused with nourishing vitamin E.',
      variants: ['Ruby Red Collection', 'Nude Palette']
    }
  ];

  for (const item of sampleProducts) {
    const slug = slugify(item.name, { lower: true, strict: true }) + '-' + nanoid(5);
    const categoryId = categoryMap[item.category] || categoryMap['men'];
    const brandId = brandMap[item.brand] || brandMap['generic'];

    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug,
        description: item.desc,
        categoryId,
        brandId,
        createdById: sellerUser.id,
        status: 'APPROVED',
      },
    });

    for (const vName of item.variants) {
      const sku = slugify(item.name + '-' + vName, { lower: true, strict: true }) + '-' + nanoid(4);
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: vName,
          sku,
          attributes: { edition: 'Standard' },
        },
      });

      await prisma.productImage.create({
        data: {
          variantId: variant.id,
          productId: product.id,
          url: item.image,
          altText: item.name,
          isPrimary: true,
          order: 1,
        },
      });

      await prisma.sellerListing.create({
        data: {
          sellerProfileId: sellerProfile.id,
          variantId: variant.id,
          price: item.price,
          mrp: item.mrp,
          stock: 50,
          reservedStock: 0,
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Comprehensive marketplace products seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
