import { AppError } from "../utils/AppError";
import { prisma } from "../app";
import slugify from "slugify";
import { nanoid } from "nanoid";

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

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      categoryId,
      brandId: brandId || null,
      createdById: userId,
      status: "DRAFT",
      variants: variants
        ? {
            create: variants.map((v: any) => ({
              name: v.name,
              sku: v.sku,
              attributes: v.attributes || {},
              images: v.images
                ? { create: v.images.map((img: any, i: number) => ({ url: img.url, altText: img.altText, isPrimary: i === 0, order: i + 1 })) }
                : undefined,
            })),
          }
        : undefined,
    },
    include: {
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

  return prisma.product.update({ where: { id: productId }, data: updateData });
};

export const deleteProduct = async (userId: string, roleName: string, productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.deletedAt) throw new AppError("Product not found", 404, "NOT_FOUND");
  if (roleName === "SELLER" && product.createdById !== userId) throw new AppError("Forbidden", 403, "FORBIDDEN");

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

export const browseProducts = async (userId: string | undefined, roleName: string | undefined, query: any) => {
  const { category, brand, sort, page = "1", limit = "20", ...attrFilters } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Role-based status filter
  let statusFilter: any;
  if (roleName === "ADMIN") {
    statusFilter = {}; // all statuses
  } else if (roleName === "SELLER" && userId) {
    statusFilter = {
      OR: [{ status: "APPROVED" }, { AND: [{ status: { not: "APPROVED" } }, { createdById: userId }] }],
    };
  } else {
    statusFilter = { status: "APPROVED" }; // public / consumer
  }

  const where: any = { deletedAt: null, ...statusFilter };

  // Category filter
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }

  // Search filter
  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' };
  }

  // Brand filter
  if (brand) {
    const b = await prisma.brand.findUnique({ where: { slug: brand } });
    if (b) where.brandId = b.id;
  }

  // Price filter: we need to filter via SellerListing
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined;

  // Attribute filters — remaining query params applied to JSONB on ProductVariant
  // We filter products that have at least 1 variant matching all attribute filters
  const attrKeys = Object.keys(attrFilters).filter(k => !["minPrice", "maxPrice", "search"].includes(k));

  // Sort
  let orderBy: any = { createdAt: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where: {
      ...where,
      variants: attrKeys.length > 0 || minPrice || maxPrice
        ? {
            some: {
              deletedAt: null,
              ...(attrKeys.length > 0
                ? { AND: attrKeys.map(k => ({ attributes: { path: [k], equals: attrFilters[k] } })) }
                : {}),
              ...(minPrice || maxPrice
                ? {
                    listings: {
                      some: {
                        isActive: true,
                        deletedAt: null,
                        ...(minPrice ? { price: { gte: minPrice } } : {}),
                        ...(maxPrice ? { price: { lte: maxPrice } } : {}),
                      },
                    },
                  }
                : {}),
            },
          }
        : undefined,
    },
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

  const total = await prisma.product.count({ where });

  // Shape: add cheapestPrice per product
  const shaped = products.map(p => {
    const cheapestListing = p.variants.flatMap(v => v.listings)[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      category: p.category,
      brand: p.brand,
      primaryImage: p.images[0]?.url ?? p.variants[0]?.images[0]?.url ?? null,
      cheapestPrice: cheapestListing?.price ?? null,
      reviewCount: p._count.reviews,
      variants: p.variants.map(v => ({ 
        id: v.id, 
        name: v.name, 
        sku: v.sku,
        hasListing: v.listings && v.listings.length > 0 
      })),
    };
  });

  return { products: shaped, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) };
};

export const getProductBySlug = async (slug: string) => {
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

  // Add availableStock to each listing
  const shaped = {
    ...product,
    variants: product.variants.map(v => ({
      ...v,
      listings: v.listings.map(l => ({
        ...l,
        availableStock: l.stock - l.reservedStock,
      })),
    })),
  };
  return shaped;
};

// ── Reviews ───────────────────────────────────────────────────

export const getProductReviews = async (productId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId, deletedAt: null },
      include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { productId, deletedAt: null } }),
  ]);

  const avgRating = total > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit), avgRating };
};

export const submitReview = async (userId: string, productId: string, body: { rating: number; title?: string; body?: string }) => {
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

  return prisma.review.create({
    data: {
      productId,
      userId,
      rating: body.rating,
      title: body.title,
      body: body.body,
    },
    include: { user: { select: { fullName: true, avatarUrl: true } } },
  });
};
