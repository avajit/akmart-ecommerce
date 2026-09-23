import { prisma } from "../app";

// Returns full nested category tree
export const getCategoryTree = async () => {
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
  return roots;
};

// Returns filterable attribute configs for a category by slug
export const getCategoryFilters = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      attributeConfigs: { orderBy: { order: "asc" } },
    },
  });
  if (!category) return null;
  return { category, filters: category.attributeConfigs };
};

// Public list of all active brands
export const getBrands = async () => {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
};
