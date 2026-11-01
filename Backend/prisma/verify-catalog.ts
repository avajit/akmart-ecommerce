/**
 * Master Enterprise Catalog Verification & Quality Assurance Suite
 * Runs automated assertion tests across all 20 Subcategories, Brands, Merchants, and Images.
 *
 * Run: cd Backend && npx tsx prisma/verify-catalog.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runCatalogVerification() {
  console.log('🔍 STARTING AKMART COMPREHENSIVE CATALOG QA AUDIT...\n');
  let totalErrors = 0;

  // 1. Check Subcategory Product Counts
  console.log('--- 1. Testing Subcategory Product Distribution ---');
  const departments = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          _count: { select: { products: true } },
        },
      },
    },
  });

  let totalSubcategories = 0;
  for (const dept of departments) {
    console.log(`📁 [${dept.name}]`);
    for (const sub of dept.children) {
      totalSubcategories++;
      const count = sub._count.products;
      if (count === 0) {
        console.error(`  ❌ FAILED: Subcategory '${sub.name}' (${sub.slug}) has 0 products!`);
        totalErrors++;
      } else {
        console.log(`  ✅ '${sub.name}' (${sub.slug}): ${count} products`);
      }
    }
  }

  // 2. Check Primary Images & HTTP Status
  console.log('\n--- 2. Testing Primary Image URLs for All Products ---');
  const products = await prisma.product.findMany({
    include: {
      images: { where: { isPrimary: true } },
      brand: true,
      category: true,
    },
  });

  console.log(`Total Products to verify: ${products.length}`);
  let checkedImages = 0;
  const uniqueUrls = new Set<string>();

  for (const p of products) {
    const primaryImg = p.images[0]?.url;
    if (!primaryImg) {
      console.error(`  ❌ FAILED: Product '${p.name}' (${p.id}) has NO primary image!`);
      totalErrors++;
      continue;
    }
    if (primaryImg.includes('placehold.co') || primaryImg.includes('400x400')) {
      console.error(`  ❌ FAILED: Product '${p.name}' is using a placeholder image: ${primaryImg}`);
      totalErrors++;
      continue;
    }
    uniqueUrls.add(primaryImg);
  }

  console.log(`Verifying HTTP 200 for ${uniqueUrls.size} unique image assets...`);
  for (const url of uniqueUrls) {
    checkedImages++;
    let success = false;
    let lastError = '';

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (res.status === 200) {
          success = true;
          break;
        } else {
          lastError = `HTTP ${res.status}`;
        }
      } catch (e: unknown) {
        lastError = (e as Error).message;
      }
      // Brief pause before retry
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    if (!success) {
      console.error(`  ❌ FAILED: Image unreachable after 3 attempts (${lastError}) -> ${url}`);
      totalErrors++;
    }
  }
  console.log(`✅ Checked ${checkedImages} unique image assets.`);

  // 3. Test Brand-Category Coherence
  console.log('\n--- 3. Testing Brand Integrity ---');
  const brandAudit = [
    { brand: 'dell', disallowedSlugs: ['smartphones', 'audio', 'tea-coffee', 'men-clothing', 'toys', 'decor'] },
    { brand: 'nike', disallowedSlugs: ['smartphones', 'laptops', 'tea-coffee', 'kitchenware', 'decor'] },
    { brand: 'ikea', disallowedSlugs: ['smartphones', 'laptops', 'men-footwear', 'audio'] },
    { brand: 'lakme', disallowedSlugs: ['smartphones', 'laptops', 'men-clothing', 'kitchenware'] },
    { brand: 'himalayan-organic', disallowedSlugs: ['smartphones', 'laptops', 'toys', 'men-footwear'] },
  ];

  for (const bCheck of brandAudit) {
    const invalidProducts = await prisma.product.findMany({
      where: {
        brand: { slug: bCheck.brand },
        category: { slug: { in: bCheck.disallowedSlugs } },
      },
      include: { category: true, brand: true },
    });

    if (invalidProducts.length > 0) {
      console.error(`  ❌ FAILED: Brand '${bCheck.brand}' has products in disallowed categories:`);
      for (const inv of invalidProducts) {
        console.error(`     - '${inv.name}' in category '${inv.category.name}'`);
      }
      totalErrors += invalidProducts.length;
    } else {
      console.log(`  ✅ Brand '${bCheck.brand}': Zero category cross-contamination.`);
    }
  }

  // 4. Test Seller Specialization Integrity
  console.log('\n--- 4. Testing Seller Specialization Integrity ---');
  const audioZone = await prisma.sellerProfile.findFirst({
    where: { shopName: 'Audio Zone Nepal' },
    include: {
      listings: {
        include: {
          variant: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
      },
    },
  });

  if (audioZone) {
    const invalidAudioListings = audioZone.listings.filter(
      l => l.variant.product.category.slug !== 'audio'
    );
    if (invalidAudioListings.length > 0) {
      console.error(`  ❌ FAILED: 'Audio Zone Nepal' is selling non-audio items! Count: ${invalidAudioListings.length}`);
      totalErrors += invalidAudioListings.length;
    } else {
      console.log(`  ✅ 'Audio Zone Nepal': Sells strictly Audio items (${audioZone.listings.length} listings).`);
    }
  }

  // 5. Test Groceries Diversity
  console.log('\n--- 5. Testing Groceries & Organic Diversity ---');
  const groceriesProducts = await prisma.product.findMany({
    where: {
      category: {
        slug: { in: ['tea-coffee', 'grains-spices'] },
      },
    },
    include: { category: true },
  });

  const distinctGroceryNames = new Set(groceriesProducts.map(p => p.name));
  console.log(`Groceries Products count: ${groceriesProducts.length} across ${distinctGroceryNames.size} distinct titles.`);
  if (distinctGroceryNames.size < 5) {
    console.error(`  ❌ FAILED: Groceries & Organic lacks diversity (only ${distinctGroceryNames.size} distinct items)!`);
    totalErrors++;
  } else {
    console.log(`  ✅ Groceries & Organic: Rich variety verified (${distinctGroceryNames.size} distinct items, no infinite clones).`);
  }

  // Summary
  console.log('\n================================================================');
  if (totalErrors === 0) {
    console.log(`🎉 ALL CATALOG QA AUDIT TESTS PASSED!`);
    console.log(`Total Subcategories: ${totalSubcategories}`);
    console.log(`Total Products: ${products.length}`);
    console.log(`Total Verified Unique Images: ${uniqueUrls.size}`);
    console.log(`Errors: 0`);
  } else {
    console.error(`❌ QA AUDIT FAILED with ${totalErrors} errors!`);
    process.exit(1);
  }
}

runCatalogVerification()
  .catch((e: unknown) => {
    console.error('Fatal error during verification:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
