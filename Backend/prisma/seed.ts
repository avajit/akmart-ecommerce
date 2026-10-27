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

  // 2. USERS (Security Gatekeeper)
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Production mode detected: Core system roles verified. Skipping demo/test user seeding.');
    return;
  }

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@akmart.com' },
    update: {},
    create: {
      email: 'admin@akmart.com',
      fullName: 'AKMart Admin',
      passwordHash: await bcrypt.hash('Admin@123', 12),
      roleId: adminRole.id,
      isEmailVerified: true,
      phoneNumber: '9801000001',
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
      phoneNumber: '9801000002',
    },
  });

  const consumerUser = await prisma.user.upsert({
    where: { email: 'consumer@akmart.com' },
    update: {},
    create: {
      email: 'consumer@akmart.com',
      fullName: 'Bikash Shrestha',
      passwordHash: await bcrypt.hash('Consumer@123', 12),
      roleId: consumerRole.id,
      isEmailVerified: true,
      phoneNumber: '9841234567',
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
    { name: 'Himalayan Organic', slug: 'himalayan-organic' },
    { name: 'Nepal Craft', slug: 'nepal-craft' },
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
    {
      name: 'Groceries & Organic',
      slug: 'groceries',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
      children: [
        { name: 'Tea & Coffee', slug: 'tea-coffee' },
        { name: 'Organic Grains & Spices', slug: 'grains-spices' }
      ]
    }
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

  // Alias slug mappings for search & direct collection filters
  categoryMap['clothing'] = categoryMap['men-clothing'];
  categoryMap['footwear'] = categoryMap['men-footwear'];
  categoryMap['handbags'] = categoryMap['women-handbags'];

  // 5. SELLER PROFILE
  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      shopName: 'TechMart & Lifestyle Nepal',
      phoneNumber: '9801000002',
      address: 'New Baneshwor, Ward 10',
      city: 'Kathmandu',
      state: 'Bagmati Province',
      pincode: '44600',
      country: 'NP',
      shopDescription: 'Official verified supplier of top-tier electronics, modern apparel, and authentic Nepali lifestyle essentials.',
      panNumber: '601234567',
      bankAccountNumber: '01201000000456',
      bankAccountName: 'TechMart Nepal Pvt Ltd',
      verificationStatus: 'VERIFIED',
      isPayoutEnabled: true,
    },
  });

  // 6. 26 REALISTIC HIGH-QUALITY PRODUCTS ACROSS NEPAL MARKET
  const sampleProducts = [
    // Men's Fashion
    {
      name: 'Classic Leather Bomber Jacket',
      category: 'men-clothing',
      brand: 'zara',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
      desc: 'Premium black leather jacket designed for ultimate comfort and timeless winter style in Kathmandu.',
      variants: [
        { name: 'Black / M', price: 6999, mrp: 9999, stock: 25, attributes: { color: 'Black', size: 'M' } },
        { name: 'Black / L', price: 6999, mrp: 9999, stock: 15, attributes: { color: 'Black', size: 'L' } },
        { name: 'Brown / M', price: 7499, mrp: 9999, stock: 10, attributes: { color: 'Brown', size: 'M' } },
      ],
    },
    {
      name: 'Nike Air Max Runner Sneakers',
      category: 'men-footwear',
      brand: 'nike',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      desc: 'Lightweight cushioning and sleek athletic design for everyday performance and running.',
      variants: [
        { name: 'Red / UK 9', price: 12499, mrp: 15999, stock: 20, attributes: { color: 'Red', shoe_size: 'UK 9' } },
        { name: 'Red / UK 10', price: 12499, mrp: 15999, stock: 12, attributes: { color: 'Red', shoe_size: 'UK 10' } },
        { name: 'Black / UK 9', price: 12999, mrp: 15999, stock: 18, attributes: { color: 'Black', shoe_size: 'UK 9' } },
      ],
    },
    {
      name: 'Traditional Palpali Dhaka Topi & Shawl Set',
      category: 'men-accessories',
      brand: 'nepal-craft',
      image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=800&auto=format&fit=crop',
      desc: 'Authentic hand-woven Palpali Dhaka Topi paired with lightweight festive woolen shawl.',
      variants: [
        { name: 'Red Maroon Pattern', price: 1499, mrp: 2199, stock: 45, attributes: { color: 'Maroon', material: 'Dhaka Cotton' } },
        { name: 'Royal Blue Pattern', price: 1499, mrp: 2199, stock: 35, attributes: { color: 'Blue', material: 'Dhaka Cotton' } },
      ],
    },
    {
      name: 'Nepali Handspun Cotton Daura Suruwal Set',
      category: 'men-clothing',
      brand: 'nepal-craft',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      desc: 'Traditional pure khadi cotton Daura Suruwal set crafted for national festivals and weddings.',
      variants: [
        { name: 'Classic Grey / Size 38', price: 3899, mrp: 4999, stock: 20, attributes: { color: 'Grey', size: '38' } },
        { name: 'Classic Grey / Size 40', price: 3899, mrp: 4999, stock: 18, attributes: { color: 'Grey', size: '40' } },
        { name: 'Off-White / Size 40', price: 3999, mrp: 5200, stock: 15, attributes: { color: 'Off-White', size: '40' } },
      ],
    },
    {
      name: 'Heavyweight Minimalist Oversized Hoodie',
      category: 'men-clothing',
      brand: 'nike',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      desc: '400GSM french terry fleece hoodie with relaxed drop-shoulder cut, kangaroo pocket.',
      variants: [
        { name: 'Onyx Black / L', price: 3299, mrp: 4500, stock: 30, attributes: { color: 'Black', size: 'L' } },
        { name: 'Forest Green / L', price: 3299, mrp: 4500, stock: 22, attributes: { color: 'Green', size: 'L' } },
      ],
    },

    // Women's Fashion
    {
      name: 'Floral Summer Wrap Dress',
      category: 'women-clothing',
      brand: 'zara',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
      desc: 'Breezy floral wrap dress with delicate ruffle trims, perfect for sunny days and outings.',
      variants: [
        { name: 'Floral Blue / S', price: 4499, mrp: 5999, stock: 30, attributes: { color: 'Blue', size: 'S' } },
        { name: 'Floral Blue / M', price: 4499, mrp: 5999, stock: 20, attributes: { color: 'Blue', size: 'M' } },
        { name: 'Floral White / M', price: 4499, mrp: 5999, stock: 15, attributes: { color: 'White', size: 'M' } },
      ],
    },
    {
      name: 'Hand-Embroidered Pashmina Chiffon Kurti Set',
      category: 'women-clothing',
      brand: 'nepal-craft',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      desc: 'Exquisite 3-piece designer kurti set with organza dupatta and cigarette pants for Dashain/Tihar.',
      variants: [
        { name: 'Pastel Peach / M', price: 5499, mrp: 7999, stock: 25, attributes: { color: 'Peach', size: 'M' } },
        { name: 'Pastel Peach / L', price: 5499, mrp: 7999, stock: 15, attributes: { color: 'Peach', size: 'L' } },
        { name: 'Emerald Green / L', price: 5899, mrp: 8200, stock: 12, attributes: { color: 'Emerald Green', size: 'L' } },
      ],
    },
    {
      name: 'Designer Vegan Leather Structured Tote',
      category: 'women-handbags',
      brand: 'zara',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
      desc: 'Spacious daily tote featuring reinforced top handles, magnetic snap closure, and interior laptop sleeve.',
      variants: [
        { name: 'Caramel Tan', price: 3499, mrp: 4999, stock: 35, attributes: { color: 'Caramel Tan' } },
        { name: 'Midnight Black', price: 3499, mrp: 4999, stock: 40, attributes: { color: 'Midnight Black' } },
      ],
    },
    {
      name: 'Pointed Toe Block Heel Pumps',
      category: 'women-footwear',
      brand: 'zara',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
      desc: 'Comfortable cushioned insole with modern 2.5-inch block heel, ideal for formal workwear.',
      variants: [
        { name: 'Nude / EU 38', price: 3899, mrp: 5200, stock: 18, attributes: { color: 'Nude', size: 'EU 38' } },
        { name: 'Black / EU 39', price: 3899, mrp: 5200, stock: 20, attributes: { color: 'Black', size: 'EU 39' } },
      ],
    },

    // Electronics & Gadgets
    {
      name: 'Samsung Galaxy S24 Ultra 5G',
      category: 'smartphones',
      brand: 'samsung',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop',
      desc: 'Galaxy AI is here. Epic camera with 200MP sensor, titanium frame, and built-in S Pen.',
      variants: [
        { name: 'Titanium Black / 12GB / 256GB', price: 144999, mrp: 159999, stock: 15, attributes: { color: 'Black', ram: '12GB', storage: '256GB' } },
        { name: 'Titanium Gray / 12GB / 512GB', price: 164999, mrp: 179999, stock: 10, attributes: { color: 'Gray', ram: '12GB', storage: '512GB' } },
      ],
    },
    {
      name: 'Apple iPhone 15 Pro Max 256GB',
      category: 'smartphones',
      brand: 'apple',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
      desc: 'Forged in titanium with A17 Pro chip, customizable Action button, and 5x Telephoto camera.',
      variants: [
        { name: 'Natural Titanium / 256GB', price: 179999, mrp: 195000, stock: 12, attributes: { color: 'Natural Titanium', storage: '256GB' } },
        { name: 'Blue Titanium / 256GB', price: 179999, mrp: 195000, stock: 8, attributes: { color: 'Blue Titanium', storage: '256GB' } },
      ],
    },
    {
      name: 'Apple MacBook Pro M3 14"',
      category: 'laptops',
      brand: 'apple',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
      desc: 'Supercharged by M3 chip for exceptional pro workflows and stunning Liquid Retina XDR display.',
      variants: [
        { name: 'Space Gray / 8GB / 512GB', price: 215000, mrp: 235000, stock: 8, attributes: { color: 'Space Gray', ram: '8GB', storage: '512GB' } },
        { name: 'Space Gray / 16GB / 512GB', price: 245000, mrp: 265000, stock: 6, attributes: { color: 'Space Gray', ram: '16GB', storage: '512GB' } },
      ],
    },
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      category: 'audio',
      brand: 'sony',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      desc: 'Industry-leading noise canceling with two processors, 8 microphones, and 30-hour battery life.',
      variants: [
        { name: 'Silver / Over-Ear', price: 42999, mrp: 49999, stock: 12, attributes: { color: 'Silver' } },
        { name: 'Midnight Black / Over-Ear', price: 42999, mrp: 49999, stock: 18, attributes: { color: 'Midnight Black' } },
      ],
    },
    {
      name: 'Apple AirPods Pro (2nd Generation)',
      category: 'audio',
      brand: 'apple',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop',
      desc: 'Up to 2x more active noise cancellation with Adaptive Audio and MagSafe charging case (USB-C).',
      variants: [
        { name: 'White / MagSafe USB-C', price: 34999, mrp: 38999, stock: 25, attributes: { color: 'White' } },
      ],
    },

    // Kids & Toys
    {
      name: 'Kids Urban Pullover Fleece Hoodie',
      category: 'boys-clothing',
      brand: 'nike',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800&auto=format&fit=crop',
      desc: 'Warm brushed fleece fabric designed for active play and all-day outdoor comfort.',
      variants: [
        { name: 'Heather Grey / Age 6-7', price: 1899, mrp: 2500, stock: 30, attributes: { color: 'Grey', size: '6-7Y' } },
        { name: 'Heather Grey / Age 8-9', price: 1899, mrp: 2500, stock: 25, attributes: { color: 'Grey', size: '8-9Y' } },
      ],
    },
    {
      name: 'Girls Twirl Tutu Party Dress',
      category: 'girls-clothing',
      brand: 'zara',
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop',
      desc: 'Layered soft tulle skirt with glittering stars and breathable pure cotton lining.',
      variants: [
        { name: 'Rose Pink / Age 4-5', price: 2299, mrp: 3100, stock: 20, attributes: { color: 'Pink', size: '4-5Y' } },
        { name: 'Rose Pink / Age 6-7', price: 2299, mrp: 3100, stock: 15, attributes: { color: 'Pink', size: '6-7Y' } },
      ],
    },
    {
      name: 'Educational Wooden Montessori Building Blocks',
      category: 'toys',
      brand: 'generic',
      image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800&auto=format&fit=crop',
      desc: '100-piece natural solid beechwood block set with non-toxic water-based color stains.',
      variants: [
        { name: '100-Piece Multi-Color Set', price: 1999, mrp: 2800, stock: 40, attributes: { material: 'Beechwood' } },
      ],
    },

    // Home & Living
    {
      name: 'Authentic Tibetan Brass Singing Bowl Set',
      category: 'decor',
      brand: 'nepal-craft',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
      desc: 'Hand-hammered 7-metal singing bowl with wooden striker and embroidered meditation cushion.',
      variants: [
        { name: 'Medium 5-inch Bowl', price: 2499, mrp: 3500, stock: 35, attributes: { size: '5-inch' } },
        { name: 'Large 7-inch Bowl', price: 3999, mrp: 5500, stock: 20, attributes: { size: '7-inch' } },
      ],
    },
    {
      name: 'Himalayan Natural Pink Salt Rock Lamp',
      category: 'decor',
      brand: 'himalayan-organic',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
      desc: '100% authentic Himalayan rock salt lamp on polished neem wooden base with dimmer cord.',
      variants: [
        { name: 'Natural Shape (3-4 kg)', price: 1599, mrp: 2200, stock: 50, attributes: { weight: '3-4kg' } },
      ],
    },
    {
      name: 'Pure Egyptian Cotton 400TC Bedsheet Set',
      category: 'bedding',
      brand: 'ikea',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop',
      desc: 'Silky sateen weave queen bedsheet with 2 pillowcases, breathable and skin-friendly.',
      variants: [
        { name: 'Cloud White / King Size', price: 3499, mrp: 4800, stock: 25, attributes: { color: 'White', size: 'King' } },
        { name: 'Slate Grey / King Size', price: 3499, mrp: 4800, stock: 30, attributes: { color: 'Grey', size: 'King' } },
      ],
    },

    // Groceries & Organic Nepal
    {
      name: 'Organic Orthodox Ilam Black Tea (500g Tin)',
      category: 'tea-coffee',
      brand: 'himalayan-organic',
      image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=800&auto=format&fit=crop',
      desc: 'First-flush high-altitude loose leaf orthodox black tea cultivated in the misty hills of Ilam, Nepal.',
      variants: [
        { name: '500g Heritage Tin', price: 850, mrp: 1100, stock: 60, attributes: { weight: '500g' } },
      ],
    },
    {
      name: 'Cold-Pressed Pure Nepali Mustard Oil (2L)',
      category: 'grains-spices',
      brand: 'himalayan-organic',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800&auto=format&fit=crop',
      desc: 'Traditional wood-pressed unfiltered mustard oil (Tori ko Tel) with natural pungent aroma and health benefits.',
      variants: [
        { name: '2 Litre Pet Bottle', price: 720, mrp: 900, stock: 80, attributes: { volume: '2L' } },
      ],
    },
    {
      name: 'Mustang Organic Red Kidney Beans (Simikot Rajma 1kg)',
      category: 'grains-spices',
      brand: 'himalayan-organic',
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=800&auto=format&fit=crop',
      desc: 'Pristine mountain-harvested red kidney beans from high altitudes of Mustang, rich in protein and flavor.',
      variants: [
        { name: '1kg Vacuum Pack', price: 390, mrp: 480, stock: 75, attributes: { weight: '1kg' } },
      ],
    },

    // Beauty & Personal Care
    {
      name: 'Lakme Absolute Matte Liquid Lip Color',
      category: 'makeup',
      brand: 'lakme',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop',
      desc: 'Smudge-proof 16-hour long-wear lightweight liquid lipstick with intense pigment payoff.',
      variants: [
        { name: 'Royal Red / 5.6ml', price: 1050, mrp: 1350, stock: 40, attributes: { shade: 'Royal Red' } },
        { name: 'Nude Cinnamon / 5.6ml', price: 1050, mrp: 1350, stock: 45, attributes: { shade: 'Nude Cinnamon' } },
      ],
    },
    {
      name: 'Himalayan Purifying Neem & Tea Tree Face Cleanser',
      category: 'skincare',
      brand: 'himalayan-organic',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      desc: 'Gentle soap-free foaming gel face wash enriched with organic neem leaf extract to clear impurities.',
      variants: [
        { name: '150ml Pump Bottle', price: 420, mrp: 550, stock: 55, attributes: { volume: '150ml' } },
      ],
    },
    {
      name: 'Ultra-Light Invisible Sunscreen Gel SPF 50 PA++++',
      category: 'skincare',
      brand: 'generic',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop',
      desc: 'Zero white cast, non-comedogenic broad-spectrum sun protection infused with hyaluronic acid.',
      variants: [
        { name: '80g Tube', price: 950, mrp: 1250, stock: 50, attributes: { weight: '80g' } },
      ],
    },
  ];

  console.log(`📦 Seeding ${sampleProducts.length} realistic Nepal catalog products...`);

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

  console.log('🎉 Seeding successfully completed! 26 realistic Nepal catalog items, users, and coupons ready.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
