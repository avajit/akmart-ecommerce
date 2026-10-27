/**
 * Realistic Nepal E-Commerce Dev & Edge-Case Mock Data
 * Used by Playwright Audit Harness to test loaded, empty, error, long-text, and many-items states.
 */

export const mockUser = {
  id: 'usr_nepal_001',
  email: 'consumer@akmart.com.np',
  fullName: 'Aarav Sharma (आरभ शर्मा)',
  phoneNumber: '+977-9841234567',
  roleName: 'CONSUMER',
  isEmailVerified: true,
};

export const mockAddresses = [
  {
    id: 'addr_01',
    recipientName: 'Aarav Sharma (आरभ शर्मा)',
    phoneNumber: '9841234567',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    city: 'Kathmandu',
    wardNumber: '22',
    streetAddress: 'Tebahal, New Road Near Sankata Temple (सङ्कटा मन्दिर नजिकै)',
    postalCode: '44600',
    isDefault: true,
  },
  {
    id: 'addr_02',
    recipientName: 'Kritika Shrestha',
    phoneNumber: '9801122334',
    province: 'Gandaki Province',
    district: 'Kaski (Pokhara)',
    city: 'Pokhara',
    wardNumber: '6',
    streetAddress: 'Lakeside, Baidam, Pokhara',
    postalCode: '33700',
    isDefault: false,
  },
];

// Single Loaded Product with multi-seller offers & variants
export const mockProductDetail = {
  id: 'prod_macbook_pro_16',
  name: 'Apple MacBook Pro 16" M3 Max (४८ जीबी युनिफाइड मेमोरी / १ टिबी एसएसडी - स्पेस ब्ल्याक)',
  slug: 'apple-macbook-pro-16-m3-max',
  description: 'नेपालमा आधिकारिक वारेन्टी सहितको नयाँ म्याकबुक प्रो। Apple M3 Max chip with 16-core CPU and 40-core GPU, 48GB Unified Memory, 1TB SSD Storage. Liquid Retina XDR display with ProMotion 120Hz.',
  brand: { id: 'brand_apple', name: 'Apple Authorized Nepal', logo: '' },
  category: { id: 'cat_laptops', name: 'Laptops & Computers', slug: 'laptops' },
  images: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
  ],
  hasVariants: true,
  variants: [
    {
      id: 'var_1tb_space_black',
      sku: 'MBP16-M3MAX-1TB-SB',
      price: 125000,
      mrp: 145000,
      stock: 8,
      attributes: { Color: 'Space Black', Storage: '1TB SSD', RAM: '48GB' },
      listings: [
        {
          id: 'list_seller_alpha',
          sellerId: 'sel_evo_store',
          sellerShopName: 'EvoStore Authorized Reseller',
          isVerifiedSeller: true,
          sellerRating: 4.9,
          price: 125000,
          stock: 8,
          isActive: true,
          deliveryDays: '1-2 Days in Kathmandu Valley',
        },
        {
          id: 'list_seller_beta',
          sellerId: 'sel_oliz_store',
          sellerShopName: 'Oliz Store Nepal',
          isVerifiedSeller: true,
          sellerRating: 4.8,
          price: 127500,
          stock: 3,
          isActive: true,
          deliveryDays: '2-3 Days Nationwide',
        },
      ],
    },
    {
      id: 'var_2tb_silver',
      sku: 'MBP16-M3MAX-2TB-SL',
      price: 155000,
      mrp: 175000,
      stock: 0, // Out of stock edge case
      attributes: { Color: 'Silver', Storage: '2TB SSD', RAM: '64GB' },
      listings: [],
    },
  ],
};

// Edge Case: 200 items in catalog
export const generateManyProducts = (count: number = 200) => {
  return Array.from({ length: count }, (_, idx) => ({
    id: `prod_bulk_${idx + 1}`,
    name: idx % 3 === 0
      ? `नेपालको उच्च हिमाली क्षेत्र मुस्ताङबाट संकलित शुद्ध जैविक सिमी (Mustang Organic Red Beans Grade A+) - ब्याच #${idx + 1}`
      : `AKMart Authentic Nepal Everyday Essential Product #${idx + 1} with High Quality Guarantee`,
    slug: `product-item-${idx + 1}`,
    price: idx % 4 === 0 ? 125000 : (idx + 1) * 350,
    mrp: (idx + 1) * 420,
    rating: (4 + (idx % 10) * 0.1).toFixed(1),
    reviewCount: (idx * 7) % 150,
    inStock: idx % 7 !== 0,
    brandName: idx % 2 === 0 ? 'Himalayan Organic' : 'Kathmandu Crafts',
    image: idx % 5 === 0 ? '' : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
  }));
};

// Cart with multi-vendor groupings
export const mockCart = {
  id: 'cart_001',
  currency: 'NPR',
  totalItems: 3,
  subtotal: 132450,
  shippingFee: 150,
  discountTotal: 2500,
  grandTotal: 130100,
  vendorGroups: [
    {
      sellerId: 'sel_evo_store',
      sellerShopName: 'EvoStore Authorized Reseller',
      items: [
        {
          id: 'cart_item_1',
          productId: 'prod_macbook_pro_16',
          variantId: 'var_1tb_space_black',
          name: 'Apple MacBook Pro 16" M3 Max (४८ जीबी युनिफाइड मेमोरी / १ टिबी)',
          price: 125000,
          mrp: 145000,
          quantity: 1,
          stock: 8,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      sellerId: 'sel_mustang_store',
      sellerShopName: 'Mustang Organic Agro Cooperative',
      items: [
        {
          id: 'cart_item_2',
          productId: 'prod_beans',
          variantId: 'var_beans_1kg',
          name: 'Mustang Organic Red Kidney Beans (मुस्ताङको अर्गानिक रातो सिमी - १ केजी)',
          price: 7450,
          mrp: 8200,
          quantity: 2,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1551462147-37885acc36f1?w=300&auto=format&fit=crop&q=80',
        },
      ],
    },
  ],
};

// Orders List & Detail
export const mockOrders = [
  {
    id: 'ord_np_982341',
    orderNumber: 'AKM-2026-982341',
    createdAt: '2026-10-25T14:32:00Z',
    status: 'SHIPPED',
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING_DELIVERY',
    totalAmount: 130100,
    trackingSteps: [
      { step: 'Order Placed', time: '25 Oct, 2:32 PM', done: true },
      { step: 'Confirmed by Merchant', time: '25 Oct, 4:15 PM', done: true },
      { step: 'Handed to Courier (Nepal Post / Delivery Express)', time: '26 Oct, 10:00 AM', done: true },
      { step: 'Out for Delivery', time: 'Estimated 28 Oct', done: false },
      { step: 'Delivered', time: 'Pending', done: false },
    ],
    items: [
      {
        id: 'oi_1',
        name: 'Apple MacBook Pro 16" M3 Max',
        quantity: 1,
        price: 125000,
        sellerShopName: 'EvoStore Authorized Reseller',
      },
    ],
    shippingAddress: mockAddresses[0],
  },
];

// Wishlist
export const mockWishlist = {
  items: [
    {
      id: 'wsh_1',
      productId: 'prod_macbook_pro_16',
      name: 'Apple MacBook Pro 16" M3 Max (स्पेस ब्ल्याक)',
      price: 125000,
      mrp: 145000,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'wsh_2',
      productId: 'prod_pashmina',
      name: 'Pure Himalayan Cashmere Pashmina Stole (हस्तनिर्मित पश्मिना शल)',
      price: 8500,
      mrp: 10200,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&auto=format&fit=crop&q=80',
    },
  ],
};
