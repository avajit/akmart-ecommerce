// Standard core categories fallback for robust navigation
export const FALLBACK_CATEGORIES = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    children: [
      { id: 'sub-smartphones', name: 'Smartphones', slug: 'smartphones' },
      { id: 'sub-laptops', name: 'Laptops', slug: 'laptops' },
      { id: 'sub-audio', name: 'Audio & Sound', slug: 'audio' },
    ],
  },
  {
    id: 'cat-home',
    name: 'Home & Living',
    slug: 'home',
    children: [
      { id: 'sub-decor', name: 'Home Decor', slug: 'decor' },
      { id: 'sub-kitchenware', name: 'Kitchenware', slug: 'kitchenware' },
      { id: 'sub-bedding', name: 'Bedding', slug: 'bedding' },
    ],
  },
  {
    id: 'cat-kids',
    name: 'Kids',
    slug: 'kids',
    children: [
      { id: 'sub-boys', name: "Boys Clothing", slug: 'boys-clothing' },
      { id: 'sub-girls', name: "Girls Clothing", slug: 'girls-clothing' },
      { id: 'sub-toys', name: 'Toys', slug: 'toys' },
    ],
  },
  {
    id: 'cat-men',
    name: 'Men',
    slug: 'men',
    children: [
      { id: 'sub-men-clothing', name: 'Clothing', slug: 'men-clothing' },
      { id: 'sub-men-footwear', name: 'Footwear', slug: 'men-footwear' },
      { id: 'sub-men-accessories', name: 'Accessories', slug: 'men-accessories' },
    ],
  },
  {
    id: 'cat-women',
    name: 'Women',
    slug: 'women',
    children: [
      { id: 'sub-women-clothing', name: 'Clothing', slug: 'women-clothing' },
      { id: 'sub-women-footwear', name: 'Footwear', slug: 'women-footwear' },
      { id: 'sub-women-handbags', name: 'Handbags', slug: 'women-handbags' },
    ],
  },
  {
    id: 'cat-beauty',
    name: 'Beauty',
    slug: 'beauty',
    children: [
      { id: 'sub-skincare', name: 'Skincare', slug: 'skincare' },
      { id: 'sub-makeup', name: 'Makeup', slug: 'makeup' },
      { id: 'sub-fragrances', name: 'Fragrances', slug: 'fragrances' },
    ],
  },
  {
    id: 'cat-groceries',
    name: 'Groceries & Organic',
    slug: 'groceries',
    children: [
      { id: 'sub-tea-coffee', name: 'Tea & Coffee', slug: 'tea-coffee' },
      { id: 'sub-grains-spices', name: 'Organic Grains & Spices', slug: 'grains-spices' },
    ],
  },
];

