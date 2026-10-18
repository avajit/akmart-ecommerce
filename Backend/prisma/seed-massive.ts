import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Men', slug: 'men', children: ['Clothing', 'Footwear', 'Accessories'] },
  { name: 'Women', slug: 'women', children: ['Clothing', 'Footwear', 'Handbags', 'Beauty'] },
  { name: 'Kids', slug: 'kids', children: ['Boys Clothing', 'Girls Clothing', 'Toys & Footwear'] },
  { name: 'Home', slug: 'home', children: ['Decor', 'Kitchenware', 'Bedding'] },
  { name: 'Beauty', slug: 'beauty', children: ['Skincare', 'Makeup', 'Fragrances'] },
  { name: 'Electronics', slug: 'electronics', children: ['Smartphones', 'Laptops', 'Audio'] },
];

const BRANDS = [
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Apple', slug: 'apple' },
  { name: 'Nike', slug: 'nike' },
  { name: 'Zara', slug: 'zara' },
  { name: 'Sony', slug: 'sony' },
  { name: 'IKEA', slug: 'ikea' },
  { name: 'Lakme', slug: 'lakme' },
  { name: 'Puma', slug: 'puma' },
  { name: 'Adidas', slug: 'adidas' },
  { name: 'Generic', slug: 'generic' },
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop"
];

async function seedMassiveCatalog() {
  console.log('🚀 Starting massive test catalog generation (10 Sellers, 100+ Products)...');

  // 1. Roles
  const sellerRole = await prisma.role.findUnique({ where: { name: 'SELLER' } });
  const consumerRole = await prisma.role.findUnique({ where: { name: 'CONSUMER' } });

  // 2. Brands
  const brandMap: Record<string, string> = {};
  for (const b of BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug, logoUrl: `https://placehold.co/100x40?text=${b.name}` },
    });
    brandMap[b.slug] = brand.id;
  }

  // 3. Categories & Subcategories
  const categoryIds: string[] = [];
  for (const parentCat of CATEGORIES) {
    const parent = await prisma.category.upsert({
      where: { slug: parentCat.slug },
      update: {},
      create: { name: parentCat.name, slug: parentCat.slug, imageUrl: `https://placehold.co/200x200?text=${parentCat.name}` },
    });
    categoryIds.push(parent.id);

    for (const childName of parentCat.children) {
      const childSlug = slugify(childName, { lower: true, strict: true });
      const child = await prisma.category.upsert({
        where: { slug: childSlug },
        update: {},
        create: { name: childName, slug: childSlug, parentId: parent.id },
      });
      categoryIds.push(child.id);
    }
  }

  // 4. Create 10 Sellers
  const sellers = [];
  for (let i = 1; i <= 10; i++) {
    const email = `seller${i}@akmartstore.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: `Vendor Hub ${i}`,
        passwordHash: await bcrypt.hash('Seller@123', 12),
        roleId: sellerRole!.id,
        isEmailVerified: true,
      },
    });

    const profile = await prisma.sellerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        shopName: `Storefront Elite ${i}`,
        shopDescription: `Official multi-brand supplier #${i}`,
        phoneNumber: `+977-98000000${i < 10 ? '0' + i : i}`,
        address: `Market Street ${i}`,
        city: i % 2 === 0 ? 'Kathmandu' : 'Pokhara',
        state: 'Bagmati',
        pincode: '44600',
        country: 'NP',
        verificationStatus: 'VERIFIED',
        isPayoutEnabled: true,
      },
    });

    sellers.push({ user, profile });
  }
  console.log(`✅ Created/Verified 10 verified sellers.`);

  // 5. Generate 100+ Products (10 per seller)
  let productCount = 0;
  for (const seller of sellers) {
    for (let j = 1; j <= 12; j++) {
      const randomCat = categoryIds[Math.floor(Math.random() * categoryIds.length)];
      const randomBrandSlug = Object.keys(brandMap)[Math.floor(Math.random() * Object.keys(brandMap).length)];
      const brandId = brandMap[randomBrandSlug];
      const imgUrl = SAMPLE_IMAGES[(productCount) % SAMPLE_IMAGES.length];
      
      const productName = `Elite Collection Item #${productCount + 1} (${randomBrandSlug.toUpperCase()})`;
      const slug = slugify(productName, { lower: true, strict: true }) + '-' + nanoid(6);
      const price = Math.floor(Math.random() * 25000) + 999;
      const mrp = price + Math.floor(Math.random() * 5000) + 500;

      const product = await prisma.product.create({
        data: {
          name: productName,
          slug,
          description: `High quality crafted item from ${seller.profile.shopName}. Fully verified and approved.`,
          categoryId: randomCat,
          brandId,
          createdById: seller.user.id,
          status: 'APPROVED', // Automatically approved by admin
        },
      });

      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: 'Standard Edition',
          sku: `SKU-${nanoid(8).toUpperCase()}`,
          attributes: { size: 'Universal', condition: 'New' },
        },
      });

      await prisma.productImage.create({
        data: {
          variantId: variant.id,
          productId: product.id,
          url: imgUrl,
          altText: productName,
          isPrimary: true,
          order: 1,
        },
      });

      await prisma.sellerListing.create({
        data: {
          sellerProfileId: seller.profile.id,
          variantId: variant.id,
          price,
          mrp,
          stock: Math.floor(Math.random() * 100) + 10,
          reservedStock: 0,
          isActive: true,
        },
      });

      productCount++;
    }
  }

  console.log(`🎉 Successfully seeded ${productCount} approved products across 10 sellers!`);
}

seedMassiveCatalog()
  .catch((e) => {
    console.error('❌ Massive seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
