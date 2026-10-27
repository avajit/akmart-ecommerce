import { AppError } from "../utils/AppError";
import { prisma, redis } from "../app";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { resolveStorageUrl, objectExists, validateStorageKey } from "../lib/storage";

// ── Product CRUD (Seller / Admin) ─────────────────────────────

export const createProduct = async (userId: string, roleName: string, body: any) => {
  // Only SELLER with a profile OR ADMIN can create
  if (roleName === "SELLER") {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError("Create a Seller Profile before adding products", 403, "PROFILE_REQUIRED");
  }

  const { name, description, categoryId, brandId, variants } = body;

  // Auto-generate unique slug
  const slug = slugify(name, { lower: true, strict: true }) + "-" + nanoid(6);

  // Extract primary image from variants to also populate product.images
  const allVariantImages: Array<{ url: string; altText?: string | null; isPrimary: boolean; order: number }> = [];
  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (v.images && Array.isArray(v.images)) {
        v.images.forEach((img: any, i: number) => {
          allVariantImages.push({
            url: img.url,
            altText: img.altText || null,
            isPrimary: img.isPrimary !== undefined ? Boolean(img.isPrimary) : i === 0,
            order: i + 1,
          });
        });
      }
    }
  }
  const primaryImg = allVariantImages.find(img => img.isPrimary) || allVariantImages[0];

  // Initial status defaults to DRAFT unless explicitly requested or submitted
  const initialStatus = body.status || (body.submitForReview ? "PENDING_REVIEW" : "DRAFT");

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      categoryId,
      brandId: brandId || null,
      createdById: userId,
      status: initialStatus,
      images: primaryImg
        ? {
            create: [
              {
                url: primaryImg.url,
                altText: primaryImg.altText || name,
                isPrimary: true,
                order: 1,
              },
            ],
          }
        : undefined,
      variants: variants
        ? {
            create: variants.map((v: any) => ({
              name: v.name,
              sku: v.sku,
              attributes: v.attributes || {},
              images: v.images
                ? {
                    create: v.images.map((img: any, i: number) => ({
                      url: img.url,
                      altText: img.altText || null,
                      isPrimary: img.isPrimary !== undefined ? Boolean(img.isPrimary) : i === 0,
                      order: i + 1,
                    })),
                  }
                : undefined,
            })),
          }
        : undefined,
    },
    include: {
      images: true,
      variants: { include: { images: true } },
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
    },
  });
  return product;
};

export const submitProductForReview = async (userId: string, roleName: string, productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { _count: { select: { variants: true } } },
  });
  if (!product || product.deletedAt) throw new AppError("Product not found", 404, "NOT_FOUND");
  if (roleName === "SELLER" && product.createdById !== userId) throw new AppError("Forbidden", 403, "FORBIDDEN");
  if (product.status !== "DRAFT" && product.status !== "REJECTED") {
    throw new AppError(`Cannot submit a product with status: ${product.status}`, 400, "INVALID_STATUS");
  }
  if (product._count.variants === 0) {
    throw new AppError("Add at least one variant before submitting for review", 400, "NO_VARIANTS");
  }
  return prisma.product.update({
    where: { id: productId },
    data: { status: "PENDING_REVIEW" },
  });
};

export const updateProduct = async (userId: string, roleName: string, productId: string, body: any) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.deletedAt) throw new AppError("Product not found", 404, "NOT_FOUND");
  if (roleName === "SELLER") {
    if (product.createdById !== userId) throw new AppError("Forbidden", 403, "FORBIDDEN");
    if (product.status === "PENDING_REVIEW" || product.status === "APPROVED") {
      throw new AppError("Cannot edit a product while it is pending review or approved", 400, "LOCKED");
    }
  }

  const { name, description, categoryId, brandId } = body;
  const updateData: any = { description, categoryId, brandId };
  if (name) {
    updateData.name = name;
  }

  // If editing a REJECTED product, revert to DRAFT
  if (product.status === "REJECTED") {
    updateData.status = "DRAFT";
    updateData.rejectionReason = null;
  }

  const updated = await prisma.product.update({ where: { id: productId }, data: updateData });

  // Invalidate cached product and catalog browse cache
  try {
    await redis.del(`cache:product:slug:${product.slug}`);
    const catalogKeys = await redis.keys("cache:catalog:*");
    if (catalogKeys.length > 0) {
      await redis.del(...catalogKeys);
    }
  } catch {
    // Non-fatal
  }

  return updated;
};

export const deleteProduct = async (userId: string, roleName: string, productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.deletedAt) throw new AppError("Product not found", 404, "NOT_FOUND");
  if (roleName === "SELLER" && product.createdById !== userId) throw new AppError("Forbidden", 403, "FORBIDDEN");

  // Invalidate cache before altering slug
  try {
    await redis.del(`cache:product:slug:${product.slug}`);
  } catch {
    // Non-fatal
  }

  // Soft delete — free up slug by appending timestamp
  return prisma.product.update({
    where: { id: productId },
    data: {
      deletedAt: new Date(),
      slug: `${product.slug}-deleted-${Date.now()}`,
    },
  });
};

// ── Product Browse (Public / Role-filtered) ───────────────────

// Dynamic linguistic stemmer: automatically matches singular & plural forms without hardcoding
const getSearchTokenVariations = (word: string): string[] => {
  const w = word.toLowerCase().trim();
  const variations = new Set<string>([w]);
  if (w.endsWith('ies') && w.length > 4) {
    variations.add(w.slice(0, -3) + 'y'); // e.g. "groceries" -> "grocery", "batteries" -> "battery"
  } else if (w.endsWith('es') && w.length > 3) {
    variations.add(w.slice(0, -2)); // e.g. "watches" -> "watch", "boxes" -> "box"
  } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) {
    variations.add(w.slice(0, -1)); // e.g. "shoes" -> "shoe", "shirts" -> "shirt", "laptops" -> "laptop"
  }
  return Array.from(variations);
};

export const browseProducts = async (userId: string | undefined, roleName: string | undefined, query: any) => {
  const { category, brand, sort, page = "1", limit = "20", ...attrFilters } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Cache check for public catalog browse queries (sub-5ms response from Redis)
  const isPublicQuery = query.mine !== "true" && query.mine !== true && query.adminView !== "true";
  const cacheKey = isPublicQuery
    ? `cache:catalog:${JSON.stringify(query)}`
    : null;

  if (cacheKey) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Non-fatal: if Redis is temporarily unreachable, fallback to database
    }
  }

  // Role-based status filter: Public storefront ALWAYS sees strictly APPROVED products
  let statusFilter: any;
  if ((query.mine === "true" || query.mine === true) && userId) {
    statusFilter = { createdById: userId }; // Seller explicit "My Products" query
  } else if (query.adminView === "true" && roleName === "ADMIN") {
    statusFilter = {}; // Admin internal moderation query
  } else {
    statusFilter = { status: "APPROVED" }; // Storefront catalog is ALWAYS strictly APPROVED
  }

  const where: any = { deletedAt: null, ...statusFilter };

  // Category filter: support parent categories & descendant children
  if (category) {
    const rootCat = await prisma.category.findUnique({
      where: { slug: category },
      include: {
        children: {
          select: {
            id: true,
            children: { select: { id: true } },
          },
        },
      },
    });

    if (rootCat) {
      const childIds = rootCat.children.map(c => c.id);
      const grandChildIds = rootCat.children.flatMap(c => c.children?.map(gc => gc.id) || []);
      const allCategoryIds = [rootCat.id, ...childIds, ...grandChildIds];
      where.categoryId = { in: allCategoryIds };
    } else {
      where.categoryId = "00000000-0000-0000-0000-000000000000";
    }
  }

  // Enterprise Multi-Vendor Dynamic Search: Zero hardcoding, multi-token, relational indexing
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const rawSearch = query.search.trim();
    const rawTokens = rawSearch.split(/\s+/).filter(Boolean);

    // Build conditions for each search word, dynamically matching its singular/plural stems across all catalog relations
    const tokenConditions = rawTokens.map((token: string) => {
      const stems = getSearchTokenVariations(token);
      return {
        OR: stems.flatMap(stem => [
          { name: { contains: stem, mode: 'insensitive' as const } },
          { description: { contains: stem, mode: 'insensitive' as const } },
          { brand: { name: { contains: stem, mode: 'insensitive' as const } } },
          { category: { name: { contains: stem, mode: 'insensitive' as const } } },
          { category: { parent: { name: { contains: stem, mode: 'insensitive' as const } } } },
          { variants: { some: { name: { contains: stem, mode: 'insensitive' as const } } } },
          { variants: { some: { sku: { contains: stem, mode: 'insensitive' as const } } } },
          { variants: { some: { listings: { some: { sellerProfile: { shopName: { contains: stem, mode: 'insensitive' as const } } } } } } },
        ])
      };
    });

    if (tokenConditions.length === 1) {
      where.OR = tokenConditions[0].OR;
    } else {
      where.AND = [
        ...(where.AND || []),
        ...tokenConditions
      ];
    }
  }

  // Brand filter
  if (brand) {
    const b = await prisma.brand.findUnique({ where: { slug: brand } });
    if (b) where.brandId = b.id;
  }

  // Price filter: we need to filter via SellerListing
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined;
  const inStockOnly = query.inStock === 'true' || query.inStock === true;

  // Attribute filters — remaining query params applied to JSONB on ProductVariant
  const attrKeys = Object.keys(attrFilters).filter(k => !["minPrice", "maxPrice", "search", "inStock", "mine"].includes(k));

  // Sort
  let orderBy: any = { createdAt: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };
  else if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "name-asc") orderBy = { name: "asc" };
  else if (sort === "name-desc") orderBy = { name: "desc" };

  const finalWhere: any = {
    ...where,
    ...(attrKeys.length > 0 || minPrice || maxPrice || inStockOnly
      ? {
          variants: {
            some: {
              deletedAt: null,
              ...(attrKeys.length > 0
                ? {
                    AND: attrKeys.map(k => {
                      const raw = String(attrFilters[k]);
                      const vals = raw.split(',').map(s => s.trim()).filter(Boolean);
                      if (vals.length > 1) {
                        return { OR: vals.map(v => ({ attributes: { path: [k], equals: v } })) };
                      }
                      return { attributes: { path: [k], equals: raw } };
                    }),
                  }
                : {}),
              ...(minPrice || maxPrice || inStockOnly
                ? {
                    listings: {
                      some: {
                        isActive: true,
                        deletedAt: null,
                        ...(inStockOnly ? { stock: { gt: 0 } } : {}),
                        ...(minPrice ? { price: { gte: minPrice } } : {}),
                        ...(maxPrice ? { price: { lte: maxPrice } } : {}),
                      },
                    },
                  }
                : {}),
            },
          },
        }
      : {}),
  };

  const isPriceSort = sort === "price-low" || sort === "price-high";
  let products: any[];
  let total: number;

  if (isPriceSort) {
    const allProducts = await prisma.product.findMany({
      where: finalWhere,
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { deletedAt: null },
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            listings: {
              where: { isActive: true, deletedAt: null },
              orderBy: { price: "asc" },
              take: 1,
            },
          },
          take: 5,
        },
        _count: { select: { reviews: true } },
      },
    });

    total = allProducts.length;

    allProducts.sort((a, b) => {
      const priceA = a.variants.flatMap(v => v.listings)[0]?.price != null ? Number(a.variants.flatMap(v => v.listings)[0].price) : (sort === "price-low" ? Infinity : -Infinity);
      const priceB = b.variants.flatMap(v => v.listings)[0]?.price != null ? Number(b.variants.flatMap(v => v.listings)[0].price) : (sort === "price-low" ? Infinity : -Infinity);
      return sort === "price-low" ? priceA - priceB : priceB - priceA;
    });

    products = allProducts.slice(skip, skip + parseInt(limit));
  } else {
    total = await prisma.product.count({ where: finalWhere });
    products = await prisma.product.findMany({
      where: finalWhere,
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { deletedAt: null },
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            listings: {
              where: { isActive: true, deletedAt: null },
              orderBy: { price: "asc" },
              take: 1,
            },
          },
          take: 1,
        },
        _count: { select: { reviews: true } },
      },
      orderBy,
      skip,
      take: parseInt(limit),
    });
  }

  // Shape: add cheapestPrice per product
  const shaped = products.map((p: any) => {
    const cheapestListing = p.variants.flatMap((v: any) => v.listings)[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      category: p.category,
      brand: p.brand,
      primaryImage: resolveStorageUrl(p.images[0]?.url ?? p.variants[0]?.images[0]?.url) ?? null,
      cheapestPrice: cheapestListing?.price ?? null,
      reviewCount: p._count?.reviews ?? 0,
      variants: p.variants.map((v: any) => ({ 
        id: v.id, 
        name: v.name, 
        sku: v.sku,
        hasListing: v.listings && v.listings.length > 0 
      })),
    };
  });

  const result = { products: shaped, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) };

  // Cache public browse results for 2 minutes
  if (cacheKey) {
    try {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 120);
    } catch {
      // Non-fatal
    }
  }

  return result;
};

export const getProductBySlug = async (slug: string) => {
  const cacheKey = `cache:product:slug:${slug}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Non-fatal
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { order: "asc" } },
      variants: {
        where: { deletedAt: null },
        include: {
          images: { orderBy: { order: "asc" } },
          listings: {
            where: { isActive: true, deletedAt: null },
            include: {
              sellerProfile: { select: { shopName: true, verificationStatus: true } },
            },
            orderBy: { price: "asc" },
          },
        },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product || product.deletedAt) throw new AppError("Product not found", 404, "NOT_FOUND");

  // Add availableStock to each listing and resolve storage URLs
  const shaped = {
    ...product,
    primaryImage: resolveStorageUrl(product.images[0]?.url ?? product.variants[0]?.images[0]?.url) ?? null,
    images: (product.images || []).map(img => ({
      ...img,
      url: resolveStorageUrl(img.url) || img.url,
    })),
    variants: product.variants.map(v => ({
      ...v,
      images: (v.images || []).map(img => ({
        ...img,
        url: resolveStorageUrl(img.url) || img.url,
      })),
      listings: v.listings.map(l => ({
        ...l,
        availableStock: l.stock - l.reservedStock,
      })),
    })),
  };

  // Cache individual product details for 5 minutes
  try {
    await redis.set(cacheKey, JSON.stringify(shaped), "EX", 300);
  } catch {
    // Non-fatal
  }

  return shaped;
};

// ── Reviews ───────────────────────────────────────────────────

export const getProductReviews = async (productId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [rawReviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId, deletedAt: null },
      include: {
        user: { select: { id: true, fullName: true, avatarKey: true, avatarUrl: true } },
        images: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { productId, deletedAt: null } }),
  ]);

  const reviews = rawReviews.map((r) => ({
    ...r,
    user: {
      ...r.user,
      avatarUrl: resolveStorageUrl(r.user.avatarKey) || r.user.avatarUrl || null,
    },
    images: r.images.map((img) => ({
      id: img.id,
      key: img.key,
      url: resolveStorageUrl(img.key),
      order: img.order,
      createdAt: img.createdAt,
    })),
  }));

  const avgRating = total > 0
    ? (rawReviews.reduce((sum, r) => sum + r.rating, 0) / rawReviews.length).toFixed(1)
    : null;

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit), avgRating };
};

export const submitReview = async (
  userId: string,
  productId: string,
  body: { rating: number; title?: string; body?: string; imageKeys?: string[] }
) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.deletedAt || product.status !== "APPROVED") {
    throw new AppError("Product not found or not available for reviews", 404, "NOT_FOUND");
  }
  if (body.rating < 1 || body.rating > 5) {
    throw new AppError("Rating must be between 1 and 5", 400, "INVALID_RATING");
  }

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existing) throw new AppError("You have already reviewed this product", 409, "ALREADY_REVIEWED");

  // Verify review photo attachment keys (ownership & existence in storage)
  const validKeys: string[] = [];
  if (body.imageKeys && Array.isArray(body.imageKeys) && body.imageKeys.length > 0) {
    const expectedPrefix = `reviews/${userId}/`;
    for (const key of body.imageKeys) {
      if (typeof key !== 'string' || !key.trim()) continue;
      const cleanKey = key.trim();
      validateStorageKey(cleanKey);

      // Enforce ownership: must belong to reviews/:userId/
      if (!cleanKey.startsWith(expectedPrefix)) {
        throw new AppError(`Access denied: Review image "${cleanKey}" does not belong to this user`, 403, "FORBIDDEN_KEY");
      }

      // Verify object exists in storage
      const exists = await objectExists(cleanKey);
      if (!exists) {
        throw new AppError(`Attached review image "${cleanKey}" not found in storage`, 400, "OBJECT_NOT_FOUND");
      }
      validKeys.push(cleanKey);
    }
  }

  // Check if customer has an actual purchase order for this product
  const verifiedPurchase = await prisma.orderItem.findFirst({
    where: {
      order: {
        userId,
        status: "CONFIRMED",
      },
      sellerListing: {
        variant: {
          productId,
        },
      },
    },
  });

  const review = await prisma.review.create({
    data: {
      productId,
      userId,
      rating: body.rating,
      title: body.title,
      body: body.body,
      isVerifiedPurchase: !!verifiedPurchase,
      images: validKeys.length > 0
        ? {
            create: validKeys.map((key, index) => ({
              key,
              order: index,
            })),
          }
        : undefined,
    },
    include: {
      user: { select: { fullName: true, avatarKey: true, avatarUrl: true } },
      images: { orderBy: { order: "asc" } },
    },
  });

  // Invalidate product cache so review counts reflect immediately
  try {
    await redis.del(`cache:product:slug:${product.slug}`);
  } catch {
    // Non-fatal
  }

  return {
    ...review,
    user: {
      ...review.user,
      avatarUrl: resolveStorageUrl(review.user.avatarKey) || review.user.avatarUrl || null,
    },
    images: review.images.map((img) => ({
      id: img.id,
      key: img.key,
      url: resolveStorageUrl(img.key),
      order: img.order,
      createdAt: img.createdAt,
    })),
  };
};

