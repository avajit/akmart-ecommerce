import { AppError } from "../utils/AppError";
import { prisma, redis } from "../app";

// ── Product Review Queue ──────────────────────────────────────

export const getPendingProducts = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PENDING_REVIEW", deletedAt: null },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
        createdBy: {
          select: {
            id: true, fullName: true, email: true,
            sellerProfile: { select: { shopName: true, verificationStatus: true } },
          },
        },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: "asc" }, // FIFO — oldest first
      skip,
      take: limit,
    }),
    prisma.product.count({ where: { status: "PENDING_REVIEW", deletedAt: null } }),
  ]);
  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getAllProducts = async (
  status?: string,
  categorySlug?: string,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;
  const where: any = { deletedAt: null };
  if (status && status !== 'ALL') where.status = status;
  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (cat) where.categoryId = cat.id;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
        createdBy: {
          select: {
            fullName: true,
            sellerProfile: { select: { shopName: true } },
          },
        },
        _count: { select: { variants: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const approveProduct = async (productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  if (product.deletedAt) throw new AppError("Product is deleted", 410, "PRODUCT_DELETED");
  if (product.status !== "PENDING_REVIEW") {
    throw new AppError(`Cannot approve a product with status: ${product.status}`, 400, "INVALID_STATUS");
  }
  const approved = await prisma.product.update({
    where: { id: productId },
    data: { status: "APPROVED", rejectionReason: null },
  });

  // Invalidate public catalog cache so the new approved product appears in search & collection immediately
  try {
    const catalogKeys = await redis.keys("cache:catalog:*");
    if (catalogKeys.length > 0) {
      await redis.del(...catalogKeys);
    }
  } catch {
    // Non-fatal
  }

  return approved;
};

export const rejectProduct = async (productId: string, reason: string) => {
  if (!reason || reason.trim().length < 5) {
    throw new AppError("Rejection reason must be at least 5 characters", 400, "REASON_REQUIRED");
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  if (product.status !== "PENDING_REVIEW") {
    throw new AppError(`Cannot reject a product with status: ${product.status}`, 400, "INVALID_STATUS");
  }
  return prisma.product.update({
    where: { id: productId },
    data: { status: "REJECTED", rejectionReason: reason.trim() },
  });
};

// ── Seller Verification ───────────────────────────────────────

export const getAllSellers = async (status?: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const where: any = {};
  if (status) where.verificationStatus = status;

  const [sellers, total] = await Promise.all([
    prisma.sellerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phoneNumber: true, createdAt: true, isActive: true } },
        _count: { select: { listings: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.sellerProfile.count({ where }),
  ]);
  return { sellers, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const verifySeller = async (sellerProfileId: string) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { id: sellerProfileId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  // Enable payout automatically if bank & tax fields are provided, or leave pending until configured
  const hasPayoutFields = Boolean(
    profile.gstNumber && profile.panNumber &&
    profile.bankAccountNumber && profile.bankIfscCode && profile.bankAccountName
  );

  const updated = await prisma.sellerProfile.update({
    where: { id: sellerProfileId },
    data: { verificationStatus: "VERIFIED", isPayoutEnabled: hasPayoutFields },
    include: { user: { select: { email: true } } },
  });

  if (updated.user?.email) {
    import('./email.service')
      .then(({ EmailService }) => EmailService.sendSellerStatusEmail(updated.user.email!, updated.shopName, true))
      .catch(() => {});
  }

  return updated;
};

export const rejectSeller = async (sellerProfileId: string) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { id: sellerProfileId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  // Deactivate all their listings if any exist
  await prisma.sellerListing.updateMany({
    where: { sellerProfileId, deletedAt: null },
    data: { isActive: false },
  });

  const updated = await prisma.sellerProfile.update({
    where: { id: sellerProfileId },
    data: { verificationStatus: "REJECTED", isPayoutEnabled: false },
    include: { user: { select: { email: true } } },
  });

  if (updated.user?.email) {
    import('./email.service')
      .then(({ EmailService }) => EmailService.sendSellerStatusEmail(updated.user.email!, updated.shopName, false))
      .catch(() => {});
  }

  return updated;
};

export const suspendSeller = async (sellerProfileId: string) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { id: sellerProfileId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  // Deactivate all their listings
  await prisma.sellerListing.updateMany({
    where: { sellerProfileId, deletedAt: null },
    data: { isActive: false },
  });

  return prisma.sellerProfile.update({
    where: { id: sellerProfileId },
    data: { verificationStatus: "SUSPENDED" },
  });
};

// ── Category Management ───────────────────────────────────────

import slugify from "slugify";

export const createCategory = async (data: {
  name: string; parentId?: string; description?: string; imageUrl?: string;
}) => {
  const slug = slugify(data.name, { lower: true, strict: true });
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError("Category with this name already exists", 409, "SLUG_CONFLICT");

  return prisma.category.create({ data: { ...data, slug } });
};

export const updateCategory = async (id: string, data: Partial<{ name: string; description: string; imageUrl: string; isActive: boolean }>) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  return prisma.category.update({ where: { id }, data });
};

export const deactivateCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  return prisma.category.update({ where: { id }, data: { isActive: false } });
};

export const getCategoryAttributes = async (categoryId: string) => {
  return prisma.categoryAttributeConfig.findMany({
    where: { categoryId },
    orderBy: { order: "asc" },
  });
};

export const addCategoryAttribute = async (categoryId: string, data: {
  key: string; label: string; filterType: "MULTISELECT" | "RANGE" | "BOOLEAN"; unit?: string; order?: number;
}) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");

  const result = await prisma.categoryAttributeConfig.upsert({
    where: { categoryId_key: { categoryId, key: data.key } },
    update: { label: data.label, filterType: data.filterType, unit: data.unit, order: data.order ?? 0 },
    create: { categoryId, ...data, order: data.order ?? 0 },
  });

  try {
    await redis.del("cache:category:tree");
    await redis.del(`cache:category:filters:${category.slug}`);
  } catch {}

  return result;
};

export const deleteCategoryAttribute = async (categoryId: string, attributeId: string) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");

  const result = await prisma.categoryAttributeConfig.delete({
    where: { id: attributeId },
  });

  try {
    await redis.del("cache:category:tree");
    await redis.del(`cache:category:filters:${category.slug}`);
  } catch {}

  return result;
};

// ── Brand Management ──────────────────────────────────────────

export const createBrand = async (data: { name: string; logoUrl?: string }) => {
  const slug = slugify(data.name, { lower: true, strict: true });
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) throw new AppError("Brand with this name already exists", 409, "SLUG_CONFLICT");
  return prisma.brand.create({ data: { ...data, slug } });
};

export const updateBrand = async (id: string, data: Partial<{ name: string; logoUrl: string; isActive: boolean }>) => {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new AppError("Brand not found", 404, "BRAND_NOT_FOUND");
  return prisma.brand.update({ where: { id }, data });
};

export const deactivateBrand = async (id: string) => {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new AppError("Brand not found", 404, "BRAND_NOT_FOUND");
  return prisma.brand.update({ where: { id }, data: { isActive: false } });
};

// ── Dashboard Stats ───────────────────────────────────────────

export const getDashboardStats = async () => {
  const [pendingProducts, pendingSellers, totalProducts, totalSellers, totalUsers] = await Promise.all([
    prisma.product.count({ where: { status: "PENDING_REVIEW", deletedAt: null } }),
    prisma.sellerProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.sellerProfile.count(),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);
  return { pendingProducts, pendingSellers, totalProducts, totalSellers, totalUsers };
};
