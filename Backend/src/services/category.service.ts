import { prisma, redis } from "../app";

// Returns full nested category tree with Redis caching
export const getCategoryTree = async () => {
  const cacheKey = "cache:category:tree";
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Non-fatal fallback
  }

  // Fetch all active categories, build tree in memory (avoids recursive SQL)
  const all = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const map = new Map<string, any>();
  all.forEach(c => map.set(c.id, { ...c, children: [] }));

  const roots: any[] = [];
  all.forEach(c => {
    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) parent.children.push(map.get(c.id));
    } else {
      roots.push(map.get(c.id));
    }
  });

  try {
    await redis.set(cacheKey, JSON.stringify(roots), "EX", 300); // 5 min cache
  } catch {}

  return roots;
};

// Returns filterable attribute configs for a category by slug,
// with recursive parent inheritance & dynamic faceted option discovery
export const getCategoryFilters = async (slugOrId: string) => {
  const cacheKey = `cache:category:filters:${slugOrId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  // 1. Fetch category and its parent hierarchy by slug or id
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
    },
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
    },
  });

  if (!category) return null;

  // Collect category chain IDs (self -> parent -> grandparent) for attribute inheritance
  const categoryIds = [category.id];
  if (category.parent) {
    categoryIds.push(category.parent.id);
    if (category.parent.parent) {
      categoryIds.push(category.parent.parent.id);
    }
  }

  // 2. Fetch attribute configs for all in chain (child configs override parent configs)
  const configs = await prisma.categoryAttributeConfig.findMany({
    where: { categoryId: { in: categoryIds } },
    orderBy: { order: "asc" },
  });

  const keyMap = new Map<string, any>();
  for (const c of configs) {
    if (!keyMap.has(c.key)) {
      keyMap.set(c.key, c);
    }
  }
  const mergedConfigs = Array.from(keyMap.values());

  // 3. Collect descendant category IDs to discover live faceted options from actual products
  const rootCat = await prisma.category.findUnique({
    where: { id: category.id },
    include: {
      children: {
        select: {
          id: true,
          children: { select: { id: true } },
        },
      },
    },
  });

  const childIds = rootCat?.children?.map(c => c.id) || [];
  const grandChildIds = rootCat?.children?.flatMap(c => c.children?.map(gc => gc.id) || []) || [];
  const allCategoryIds = [category.id, ...childIds, ...grandChildIds];

  // 4. Query active approved variants in these categories to extract distinct values
  const variants = await prisma.productVariant.findMany({
    where: {
      deletedAt: null,
      product: {
        categoryId: { in: allCategoryIds },
        status: "APPROVED",
        deletedAt: null,
      },
      listings: {
        some: { isActive: true, deletedAt: null },
      },
    },
    select: {
      attributes: true,
    },
    take: 500,
  });

  // 5. Enrich configs with distinct options discovered from live inventory
  const enrichedConfigs = mergedConfigs.map(config => {
    const valuesSet = new Set<string>();
    for (const v of variants) {
      const attrs = (v.attributes as Record<string, any>) || {};
      const val = attrs[config.key];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        valuesSet.add(String(val).trim());
      }
    }

    return {
      id: config.id,
      key: config.key,
      label: config.label,
      filterType: config.filterType,
      unit: config.unit,
      options: Array.from(valuesSet).sort(),
    };
  });

  const result = { category, filters: enrichedConfigs };

  try {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 120); // 2 min cache
  } catch {}

  return result;
};

// Public list of all active brands
export const getBrands = async () => {
  const cacheKey = "cache:brands:all";
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });

  try {
    await redis.set(cacheKey, JSON.stringify(brands), "EX", 600);
  } catch {}

  return brands;
};
