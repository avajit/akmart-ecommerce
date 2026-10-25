import { PrismaClient, FilterType } from '@prisma/client';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive marketplace database seed with dynamic attribute architecture...');

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

  // 4. CATEGORIES (Parent Departments + Subcategories)
  const categoriesData = [
    { 
      name: 'Men', 
      slug: 'men', 
      imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=600&auto=format&fit=crop',
      children: [
        { name: 'Clothing', slug: 'men-clothing' },
        { name: 'Footwear', slug: 'men-footwear' },
        { name: 'Accessories', slug: 'men-accessories' }
      ] 
    },
    { 
      name: 'Women', 
      slug: 'women', 
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
      children: [
        { name: 'Clothing', slug: 'women-clothing' },
        { name: 'Footwear', slug: 'women-footwear' },
        { name: 'Handbags', slug: 'women-handbags' },
        { name: 'Beauty', slug: 'women-beauty' }
      ] 
    },
    { 
      name: 'Kids', 
      slug: 'kids', 
      imageUrl: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=600&auto=format&fit=crop',
      children: [
        { name: 'Boys Clothing', slug: 'boys-clothing' },
        { name: 'Girls Clothing', slug: 'girls-clothing' },
        { name: 'Toys', slug: 'toys' }
      ] 
    },
    { 
      name: 'Home & Living', 
      slug: 'home', 
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
      children: [
        { name: 'Decor', slug: 'decor' },
        { name: 'Kitchenware', slug: 'kitchenware' },
        { name: 'Bedding', slug: 'bedding' }
      ] 
    },
    { 
      name: 'Beauty', 
      slug: 'beauty', 
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
      children: [
        { name: 'Skincare', slug: 'skincare' },
        { name: 'Makeup', slug: 'makeup' },
        { name: 'Fragrances', slug: 'fragrances' }
      ] 
    },
    { 
      name: 'Electronics', 
      slug: 'electronics', 
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop',
      children: [
        { name: 'Smartphones', slug: 'smartphones' },
        { name: 'Laptops', slug: 'laptops' },
        { name: 'Audio', slug: 'audio' }
      ] 
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const parentCat of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { slug: parentCat.slug },
      update: { name: parentCat.name, imageUrl: parentCat.imageUrl },
      create: { name: parentCat.name, slug: parentCat.slug, imageUrl: parentCat.imageUrl },
    });
    categoryMap[parentCat.slug] = parent.id;

    for (const child of parentCat.children) {
      const childRecord = await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id },
        create: { name: child.name, slug: child.slug, parentId: parent.id },
      });
      categoryMap[child.slug] = childRecord.id;
    }
  }

  // Also support alias slug mapping (e.g. 'clothing' -> 'men-clothing', 'footwear' -> 'men-footwear')
  categoryMap['clothing'] = categoryMap['men-clothing'];
  categoryMap['footwear'] = categoryMap['men-footwear'];
  categoryMap['handbags'] = categoryMap['women-handbags'];

  // 5. SEED CATEGORY ATTRIBUTE CONFIGS (Taxonomy schema rules for 1000+ categories)
  const attributeConfigs = [
    // Clothing (Size, Color, Material)
    { categoryId: categoryMap['men-clothing'], key: 'size', label: 'Size', filterType: FilterType.MULTISELECT, order: 1 },
    { categoryId: categoryMap['men-clothing'], key: 'color', label: 'Color', filterType: FilterType.MULTISELECT, order: 2 },
    { categoryId: categoryMap['men-clothing'], key: 'material', label: 'Fabric / Material', filterType: FilterType.MULTISELECT, order: 3 },

    { categoryId: categoryMap['women-clothing'], key: 'size', label: 'Size', filterType: FilterType.MULTISELECT, order: 1 },
    { categoryId: categoryMap['women-clothing'], key: 'color', label: 'Color', filterType: FilterType.MULTISELECT, order: 2 },

    // Footwear (Shoe Size, Color)
    { categoryId: categoryMap['men-footwear'], key: 'shoe_size', label: 'Shoe Size', filterType: FilterType.MULTISELECT, order: 1 },
    { categoryId: categoryMap['men-footwear'], key: 'color', label: 'Color', filterType: FilterType.MULTISELECT, order: 2 },

    // Electronics Parent (Color)
    { categoryId: categoryMap['electronics'], key: 'color', label: 'Color', filterType: FilterType.MULTISELECT, order: 1 },

    // Smartphones (inherits Color from Electronics, adds RAM & Storage)
    { categoryId: categoryMap['smartphones'], key: 'ram', label: 'RAM', filterType: FilterType.MULTISELECT, unit: 'GB', order: 2 },
    { categoryId: categoryMap['smartphones'], key: 'storage', label: 'Internal Storage', filterType: FilterType.MULTISELECT, unit: 'GB', order: 3 },

    // Laptops (inherits Color, adds RAM, Processor, Storage)
    { categoryId: categoryMap['laptops'], key: 'ram', label: 'RAM', filterType: FilterType.MULTISELECT, unit: 'GB', order: 2 },
    { categoryId: categoryMap['laptops'], key: 'processor', label: 'Processor', filterType: FilterType.MULTISELECT, order: 3 },
    { categoryId: categoryMap['laptops'], key: 'storage', label: 'Storage (SSD)', filterType: FilterType.MULTISELECT, unit: 'GB', order: 4 },

    // Audio (inherits Color, adds Form Factor & Connectivity)
    { categoryId: categoryMap['audio'], key: 'form_factor', label: 'Type', filterType: FilterType.MULTISELECT, order: 2 },
    { categoryId: categoryMap['audio'], key: 'connectivity', label: 'Connectivity', filterType: FilterType.MULTISELECT, order: 3 },
  ];

  for (const cfg of attributeConfigs) {
    if (cfg.categoryId) {
      await prisma.categoryAttributeConfig.upsert({
        where: {
          categoryId_key: {
            categoryId: cfg.categoryId,
            key: cfg.key,
          },
        },
        update: { label: cfg.label, filterType: cfg.filterType, unit: cfg.unit, order: cfg.order },
        create: cfg,
      });
    }
  }

  // 6. SELLER PROFILE
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

  // 7. RICH PRODUCTS WITH DYNAMIC VARIANT ATTRIBUTES
  const sampleProducts = [
    {
      name: 'Classic Leather Bomber Jacket',
      category: 'men-clothing',
      brand: 'zara',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
      desc: 'Premium black leather jacket designed for ultimate comfort and timeless style.',
      variants: [
        { name: 'Black / M', price: 6999, mrp: 9999, stock: 25, attributes: { color: 'Black', size: 'M', material: 'Genuine Leather' } },
        { name: 'Black / L', price: 6999, mrp: 9999, stock: 15, attributes: { color: 'Black', size: 'L', material: 'Genuine Leather' } },
        { name: 'Brown / M', price: 7499, mrp: 9999, stock: 10, attributes: { color: 'Brown', size: 'M', material: 'Genuine Leather' } },
        { name: 'Brown / L', price: 7499, mrp: 9999, stock: 8, attributes: { color: 'Brown', size: 'L', material: 'Genuine Leather' } },
      ],
    },
    {
      name: 'Nike Air Max Runner Sneakers',
      category: 'men-footwear',
      brand: 'nike',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      desc: 'Lightweight cushioning and sleek athletic design for everyday performance.',
      variants: [
        { name: 'Red / UK 9', price: 12499, mrp: 15999, stock: 20, attributes: { color: 'Red', shoe_size: 'UK 9' } },
        { name: 'Red / UK 10', price: 12499, mrp: 15999, stock: 12, attributes: { color: 'Red', shoe_size: 'UK 10' } },
        { name: 'Black / UK 9', price: 12999, mrp: 15999, stock: 18, attributes: { color: 'Black', shoe_size: 'UK 9' } },
        { name: 'Black / UK 10', price: 12999, mrp: 15999, stock: 5, attributes: { color: 'Black', shoe_size: 'UK 10' } },
      ],
    },
    {
      name: 'Floral Summer Wrap Dress',
      category: 'women-clothing',
      brand: 'zara',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
      desc: 'Breezy floral wrap dress perfect for sunny days and casual outings.',
      variants: [
        { name: 'Floral Blue / S', price: 4499, mrp: 5999, stock: 30, attributes: { color: 'Floral Blue', size: 'S' } },
        { name: 'Floral Blue / M', price: 4499, mrp: 5999, stock: 20, attributes: { color: 'Floral Blue', size: 'M' } },
        { name: 'Floral White / S', price: 4499, mrp: 5999, stock: 15, attributes: { color: 'Floral White', size: 'S' } },
      ],
    },
    {
      name: 'Samsung Galaxy S24 Ultra 5G',
      category: 'smartphones',
      brand: 'samsung',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop',
      desc: 'Galaxy AI is here. Epic camera with 200MP sensor, titanium frame, and built-in S Pen.',
      variants: [
        { name: 'Titanium Black / 12GB / 256GB', price: 144999, mrp: 159999, stock: 15, attributes: { color: 'Titanium Black', ram: '12GB', storage: '256GB' } },
        { name: 'Titanium Gray / 12GB / 512GB', price: 164999, mrp: 179999, stock: 10, attributes: { color: 'Titanium Gray', ram: '12GB', storage: '512GB' } },
      ],
    },
    {
      name: 'Apple MacBook Pro M3 14"',
      category: 'laptops',
      brand: 'apple',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
      desc: 'Supercharged by M3 chip for exceptional pro workflows and stunning Liquid Retina XDR display.',
      variants: [
        { name: 'Space Gray / 8GB / 512GB', price: 215000, mrp: 235000, stock: 8, attributes: { color: 'Space Gray', ram: '8GB', storage: '512GB', processor: 'Apple M3' } },
        { name: 'Space Gray / 16GB / 512GB', price: 245000, mrp: 265000, stock: 6, attributes: { color: 'Space Gray', ram: '16GB', storage: '512GB', processor: 'Apple M3' } },
        { name: 'Silver / 16GB / 1TB', price: 275000, mrp: 295000, stock: 4, attributes: { color: 'Silver', ram: '16GB', storage: '1TB', processor: 'Apple M3' } },
      ],
    },
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      category: 'audio',
      brand: 'sony',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      desc: 'Industry-leading noise canceling with two processors and 8 microphones.',
      variants: [
        { name: 'Silver / Over-Ear', price: 42999, mrp: 49999, stock: 12, attributes: { color: 'Silver', form_factor: 'Over-Ear', connectivity: 'Bluetooth 5.2' } },
        { name: 'Midnight Black / Over-Ear', price: 42999, mrp: 49999, stock: 18, attributes: { color: 'Midnight Black', form_factor: 'Over-Ear', connectivity: 'Bluetooth 5.2' } },
      ],
    },
    {
      name: 'Minimalist Ceramic Table Lamp',
      category: 'decor',
      brand: 'ikea',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
      desc: 'Elegant ambient lighting crafted from matte ceramic and warm brass accents.',
      variants: [
        { name: 'Warm White', price: 3499, mrp: 4999, stock: 40, attributes: { color: 'Warm White' } },
        { name: 'Matte Charcoal', price: 3499, mrp: 4999, stock: 25, attributes: { color: 'Matte Charcoal' } },
      ],
    },
    {
      name: 'Luxury Velvet Oversized T-Shirt',
      category: 'men-clothing',
      brand: 'zara',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      desc: 'Ultra-soft heavyweight combed cotton oversized tee for modern street aesthetic.',
      variants: [
        { name: 'White / S', price: 1999, mrp: 2999, stock: 35, attributes: { color: 'White', size: 'S', material: 'Cotton' } },
        { name: 'White / M', price: 1999, mrp: 2999, stock: 50, attributes: { color: 'White', size: 'M', material: 'Cotton' } },
        { name: 'Navy / M', price: 1999, mrp: 2999, stock: 40, attributes: { color: 'Navy', size: 'M', material: 'Cotton' } },
        { name: 'Navy / L', price: 1999, mrp: 2999, stock: 30, attributes: { color: 'Navy', size: 'L', material: 'Cotton' } },
      ],
    },
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

    for (const v of item.variants) {
      const sku = slugify(item.name + '-' + v.name, { lower: true, strict: true }) + '-' + nanoid(4);
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: v.name,
          sku,
          attributes: v.attributes,
        },
      });

      await prisma.productImage.create({
        data: {
          variantId: variant.id,
          productId: product.id,
          url: item.image,
          altText: `${item.name} - ${v.name}`,
          isPrimary: true,
          order: 1,
        },
      });

      await prisma.sellerListing.create({
        data: {
          sellerProfileId: sellerProfile.id,
          variantId: variant.id,
          price: v.price,
          mrp: v.mrp,
          stock: v.stock,
          reservedStock: 0,
          isActive: true,
        },
      });
    }
  }

  // 7. ENTERPRISE PROMOTIONS & COUPONS
  console.log('🎟️ Seeding platform discount coupons...');
  await prisma.coupon.upsert({
    where: { code: 'AKMART10' },
    update: {
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscount: 500,
      minOrderAmount: 1000,
      isActive: true,
    },
    create: {
      code: 'AKMART10',
      description: '10% discount on orders above NPR 1,000 (Max discount NPR 500)',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscount: 500,
      minOrderAmount: 1000,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FESTIVE500' },
    update: {
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscount: 500,
      minOrderAmount: 3000,
      isActive: true,
    },
    create: {
      code: 'FESTIVE500',
      description: '15% festive discount on orders above NPR 3,000 (Max discount NPR 500)',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscount: 500,
      minOrderAmount: 3000,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME100' },
    update: {
      discountType: 'FIXED',
      discountValue: 100,
      maxDiscount: 100,
      minOrderAmount: 500,
      isActive: true,
    },
    create: {
      code: 'WELCOME100',
      description: 'Flat NPR 100 discount on your order above NPR 500',
      discountType: 'FIXED',
      discountValue: 100,
      maxDiscount: 100,
      minOrderAmount: 500,
      isActive: true,
    },
  });

  console.log('✅ Comprehensive marketplace products & coupons seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
