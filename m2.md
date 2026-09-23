# Module 2: Core Commerce — Multi-Vendor Marketplace Schema (Corrected)

**Goal**: Build a production-grade, Amazon/Flipkart-style multi-vendor marketplace schema that handles Sellers listing products and Consumers discovering and purchasing them — designed to scale from Day 1.

> **Correction applied in this version:** Stock is no longer reserved at "Add to Cart." Reservation now happens only during active checkout (Module 3), with a short TTL and an expiry cleanup job. See "Stock Safety" section for the full corrected flow and reasoning.

---

## Architecture Decisions (Finalized)

| Decision | Choice | Reasoning |
|---|---|---|
| Product approval | Yes for new catalog entries, No for new listings on existing products | Prevents catalog pollution; matches Amazon's actual model |
| Seller model | **Multi-seller (Amazon-style)** | `SellerListing` is separate from `Product`; impossible to migrate later if skipped now |
| Attributes | **JSONB on `ProductVariant`** + `CategoryAttributeConfig` for filter labels | 90% flexibility, 10% EAV complexity |
| Seller onboarding | **Minimal profile first** (shop name, phone, address) → GST/bank before payout | Low-friction signup, monetization-safe |
| Stock reservation | **Only at checkout, not at add-to-cart** | Matches real Amazon/Flipkart behavior; prevents idle carts from starving stock |
| `Product.slug` | Auto-generated from `name` (+ short id suffix) | Never trust manual, unique, URL-safe input from sellers |
| Category seeding | Seed a real starter tree now (Electronics, Clothing, Groceries, etc.) | Empty tree makes local dev/testing painful |
| Product images | Placeholder URLs for now, S3 wired up later | Isolated feature, doesn't block core commerce loop |

---

## How the System Works (End-to-End)

### Seller Flow
```
Seller registers → role = SELLER
  ↓
Creates SellerProfile (shop name, phone, address) — required before listing
  ↓
Browses catalog → searches for existing product
  ├── Product EXISTS (APPROVED) → Creates SellerListing instantly (no approval)
  │     └── Sets: price, MRP, stock per variant
  └── Product DOES NOT EXIST → Creates Product (status = PENDING_REVIEW)
        └── Admin reviews → APPROVED → Seller can now create a SellerListing
  ↓
GST + Bank details added later → isPayoutEnabled = true → Can withdraw earnings
```

### Consumer Flow (Corrected Stock Behavior)
```
Consumer browses → sees product listing
  └── Default sort: lowest SellerListing.price shown first
  ↓
Clicks product → sees all sellers offering it (price comparison)
  └── Selects seller → "Sold by: TechMart | ₹74,999 | In Stock"
  ↓
Add to Cart
  └── Live check: availableStock = stock - reservedStock (sanity check only)
  └── CartItem.priceAtAddTime = snapshot of current price
  └── NO reservedStock change — nothing is locked yet
  ↓
Views Cart
  └── Re-validates availability live on page load
  └── Shows "Only 2 left" / "No longer available" inline if stock changed
  ↓
Starts Checkout (Module 3)
  └── NOW reservedStock += quantity, tied to a PENDING order with expiresAt (~10-15 min)
  ↓
Payment succeeds
  └── stock -= quantity, reservedStock -= quantity, order → CONFIRMED
  ↓
Payment fails / times out
  └── Background job releases reservedStock, order → EXPIRED / CANCELLED
```

---

## Database Schema

### 1. Category (Hierarchical Tree)

```prisma
model Category {
  id               String                    @id @default(uuid())
  name             String
  slug             String                    @unique
  description      String?
  imageUrl         String?
  parentId         String?
  parent           Category?                 @relation("CategoryTree", fields: [parentId], references: [id])
  children         Category[]                @relation("CategoryTree")
  attributeConfigs CategoryAttributeConfig[]
  products         Product[]
  isActive         Boolean                   @default(true)
  createdAt        DateTime                  @default(now())
  updatedAt        DateTime                  @updatedAt

  @@index([parentId])
  @@index([slug])
}
```

**Example tree:**
```
Electronics (parentId: null)
  └── Smartphones (parentId: Electronics.id)
        └── Android Phones (parentId: Smartphones.id)
Clothing
  └── Men's
        └── T-Shirts
```

---

### 2. CategoryAttributeConfig (Filter definitions per category)

```prisma
model CategoryAttributeConfig {
  id         String     @id @default(uuid())
  categoryId String
  category   Category   @relation(fields: [categoryId], references: [id])
  key        String     // JSON key: "ram", "color", "size", "battery"
  label      String     // Display label: "RAM", "Color", "Size", "Battery"
  filterType FilterType @default(MULTISELECT)
  unit       String?    // "GB", "mAh", "inches"
  order      Int        @default(0)

  @@unique([categoryId, key])
  @@index([categoryId])
}

enum FilterType {
  MULTISELECT
  RANGE
  BOOLEAN
}
```

---

### 3. Brand

```prisma
model Brand {
  id        String    @id @default(uuid())
  name      String    @unique
  slug      String    @unique
  logoUrl   String?
  isActive  Boolean   @default(true)
  products  Product[]
  createdAt DateTime  @default(now())

  @@index([slug])
}
```

---

### 4. SellerProfile (Minimal onboarding → payout verification)

```prisma
model SellerProfile {
  id                 String             @id @default(uuid())
  userId             String             @unique
  user               User               @relation(fields: [userId], references: [id])

  // ── Required BEFORE first listing ──────────────────────────
  shopName           String
  shopDescription    String?
  shopLogoUrl        String?
  phoneNumber        String
  address            String
  city               String
  state              String
  pincode            String
  country            String             @default("NP")

  // ── Required BEFORE first PAYOUT (not before listing) ──────
  gstNumber          String?
  panNumber          String?
  bankAccountNumber  String?
  bankIfscCode       String?
  bankAccountName    String?

  verificationStatus SellerVerification @default(PENDING)
  isPayoutEnabled    Boolean            @default(false)

  listings           SellerListing[]

  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

enum SellerVerification {
  PENDING
  VERIFIED
  REJECTED
  SUSPENDED
}
```

---

### 5. Product (Catalog — shared by all sellers)

```prisma
model Product {
  id              String           @id @default(uuid())
  name            String
  slug            String           @unique // auto-generated: slugify(name) + '-' + shortId
  description     String
  categoryId      String
  category        Category         @relation(fields: [categoryId], references: [id])
  brandId         String?
  brand           Brand?           @relation(fields: [brandId], references: [id])
  variants        ProductVariant[]
  images          ProductImage[]
  reviews         Review[]
  status          ProductStatus    @default(DRAFT)
  rejectionReason String?
  createdById     String
  createdBy       User             @relation("ProductCreator", fields: [createdById], references: [id])
  deletedAt       DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([categoryId])
  @@index([brandId])
  @@index([status])
  @@index([slug])
  @@index([createdById])
}

enum ProductStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
  ARCHIVED
}
```

**Product Approval Workflow:**
```
Seller creates Product → status: DRAFT
  ↓ Seller clicks "Submit for Review"
status: PENDING_REVIEW → Admin gets notified
  ↓ Admin reviews
  ├── APPROVED → Product is live; Seller can now create a SellerListing
  └── REJECTED → rejectionReason set; Seller notified
```

---

### 6. ProductVariant (SKU-level — the actual thing being sold)

```prisma
model ProductVariant {
  id            String          @id @default(uuid())
  productId     String
  product       Product         @relation(fields: [productId], references: [id])
  name          String          // "Black / 256GB / 8GB RAM"
  sku           String          @unique
  attributes    Json            @default("{}")
  images        ProductImage[]
  listings      SellerListing[]
  cartItems     CartItem[]
  wishlistItems WishlistItem[]
  deletedAt     DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([productId])
  @@index([sku])
}
```

**Example `attributes` JSONB for a Smartphone variant:**
```json
{
  "color": "Phantom Black",
  "storage": "256",
  "ram": "8",
  "battery": "5000",
  "is5g": true
}
```

---

### 7. ProductImage

```prisma
model ProductImage {
  id        String          @id @default(uuid())
  productId String?
  product   Product?        @relation(fields: [productId], references: [id])
  variantId String?
  variant   ProductVariant? @relation(fields: [variantId], references: [id])
  url       String          // placeholder URL for now; S3 wired later
  altText   String?
  isPrimary Boolean         @default(false)
  order     Int             @default(0)
  createdAt DateTime        @default(now())

  @@index([productId])
  @@index([variantId])
}
```

---

### 8. SellerListing ⭐ (The Core of Multi-Vendor)

```prisma
model SellerListing {
  id              String         @id @default(uuid())
  sellerProfileId String
  sellerProfile   SellerProfile  @relation(fields: [sellerProfileId], references: [id])
  variantId       String
  variant         ProductVariant @relation(fields: [variantId], references: [id])

  price           Decimal        @db.Decimal(10, 2)
  mrp             Decimal        @db.Decimal(10, 2)

  // reservedStock is now only touched during active checkout (Module 3), not add-to-cart
  stock           Int            @default(0)
  reservedStock   Int            @default(0)

  isActive        Boolean        @default(true)
  cartItems       CartItem[]
  deletedAt       DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@unique([sellerProfileId, variantId])
  @@index([variantId])
  @@index([sellerProfileId])
  @@index([isActive])
}
```

**Available stock formula (for UI display, checked live — not stored):**
```
availableStock = stock - reservedStock
```

---

### 9. Cart + CartItem

```prisma
model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id              String         @id @default(uuid())
  cartId          String
  cart            Cart           @relation(fields: [cartId], references: [id])
  variantId       String
  variant         ProductVariant @relation(fields: [variantId], references: [id])
  sellerListingId String
  sellerListing   SellerListing  @relation(fields: [sellerListingId], references: [id])
  quantity        Int            @default(1)
  priceAtAddTime  Decimal        @db.Decimal(10, 2)

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@unique([cartId, sellerListingId])
  @@index([cartId])
  @@index([sellerListingId])
}
```

---

### 10. Wishlist + WishlistItem

```prisma
model Wishlist {
  id        String         @id @default(uuid())
  userId    String         @unique
  user      User           @relation(fields: [userId], references: [id])
  items     WishlistItem[]
  createdAt DateTime       @default(now())
}

model WishlistItem {
  id         String         @id @default(uuid())
  wishlistId String
  wishlist   Wishlist       @relation(fields: [wishlistId], references: [id])
  variantId  String
  variant    ProductVariant @relation(fields: [variantId], references: [id])
  createdAt  DateTime       @default(now())

  @@unique([wishlistId, variantId])
  @@index([wishlistId])
}
```

---

### 11. Review

```prisma
model Review {
  id                 String    @id @default(uuid())
  productId          String
  product            Product   @relation(fields: [productId], references: [id])
  userId             String
  user               User      @relation(fields: [userId], references: [id])
  rating             Int
  title              String?
  body               String?
  isVerifiedPurchase Boolean   @default(false)
  deletedAt          DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@unique([productId, userId])
  @@index([productId])
  @@index([userId])
}
```

---

### User Model Changes (additions only)

```prisma
sellerProfile  SellerProfile?
cart           Cart?
wishlist       Wishlist?
reviews        Review[]
products       Product[]  @relation("ProductCreator")
```

---

## API Endpoints

### Seller APIs (requires `SELLER` role + SellerProfile)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/seller/profile` | Create seller profile |
| `GET` | `/api/v1/seller/profile` | Get own seller profile |
| `PATCH` | `/api/v1/seller/profile` | Update seller profile |
| `POST` | `/api/v1/seller/products` | Create new product (→ PENDING_REVIEW) |
| `GET` | `/api/v1/seller/products` | List my products |
| `PATCH` | `/api/v1/seller/products/:id` | Update product |
| `POST` | `/api/v1/seller/listings` | Create listing on existing APPROVED product |
| `GET` | `/api/v1/seller/listings` | Get my listings |
| `PATCH` | `/api/v1/seller/listings/:id` | Update price/stock |
| `DELETE` | `/api/v1/seller/listings/:id` | Deactivate listing |

### Consumer APIs (public + authenticated)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/products` | Browse products (filter, sort, paginate) |
| `GET` | `/api/v1/products/:slug` | Product detail + all seller listings |
| `GET` | `/api/v1/categories` | Category tree |
| `GET` | `/api/v1/categories/:slug/products` | Products in a category |
| `GET` | `/api/v1/cart` | Get my cart (re-validates stock live) |
| `POST` | `/api/v1/cart/items` | Add item to cart (live stock check, no reservation) |
| `PATCH` | `/api/v1/cart/items/:id` | Update quantity |
| `DELETE` | `/api/v1/cart/items/:id` | Remove from cart |
| `GET` | `/api/v1/wishlist` | Get my wishlist |
| `POST` | `/api/v1/wishlist/items` | Add to wishlist |
| `DELETE` | `/api/v1/wishlist/items/:variantId` | Remove from wishlist |
| `POST` | `/api/v1/products/:id/reviews` | Submit review |
| `GET` | `/api/v1/products/:id/reviews` | Get product reviews |

### Admin APIs (requires `ADMIN` role)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/products/pending` | Products awaiting review |
| `PATCH` | `/api/v1/admin/products/:id/approve` | Approve product |
| `PATCH` | `/api/v1/admin/products/:id/reject` | Reject with reason |
| `GET` | `/api/v1/admin/sellers` | All seller profiles |
| `PATCH` | `/api/v1/admin/sellers/:id/verify` | Verify seller (enable payout) |

---

## Stock Safety: Corrected Transaction Pattern

**Key change: stock is only checked (not reserved) at add-to-cart. Reservation happens only at checkout (Module 3), with a TTL.**

### Add to Cart — live check only, no reservation

```ts
await prisma.$transaction(async (tx) => {
  const listing = await tx.sellerListing.findUnique({ where: { id: listingId } });
  const available = listing.stock - listing.reservedStock;

  if (available < quantity) {
    throw new AppError('Insufficient stock', 400, 'OUT_OF_STOCK');
  }

  await tx.cartItem.upsert({
    where: { cartId_sellerListingId: { cartId, sellerListingId: listingId } },
    create: { cartId, variantId, sellerListingId: listingId, quantity, priceAtAddTime: listing.price },
    update: { quantity: { increment: quantity } }
  });
});
```

### Remove from Cart — simple delete, nothing to release

```ts
await prisma.cartItem.delete({ where: { id: cartItemId } });
```

### View Cart — re-validate live on every load

```ts
const items = await prisma.cartItem.findMany({
  where: { cartId },
  include: { sellerListing: true }
});

const validated = items.map(item => {
  const available = item.sellerListing.stock - item.sellerListing.reservedStock;
  return {
    ...item,
    isAvailable: available >= item.quantity,
    availableStock: available
  };
});
```

### Start Checkout (Module 3 — this is where reservation actually happens)

```ts
await prisma.$transaction(async (tx) => {
  const listing = await tx.sellerListing.findUnique({ where: { id: listingId } });
  const available = listing.stock - listing.reservedStock;

  if (available < quantity) {
    throw new AppError('Insufficient stock', 400, 'OUT_OF_STOCK');
  }

  await tx.sellerListing.update({
    where: { id: listingId },
    data: { reservedStock: { increment: quantity } }
  });

  // Create PENDING order/orderItem here with expiresAt = now + 15min
});
```

### Payment Success — finalize stock

```ts
await prisma.$transaction(async (tx) => {
  await tx.sellerListing.update({
    where: { id: listingId },
    data: {
      stock: { decrement: quantity },
      reservedStock: { decrement: quantity }
    }
  });
  // order status -> CONFIRMED
});
```

### Payment Failure / Expiry — release reservation (background job)

```ts
// Runs on a schedule (e.g. every 1-5 min via node-cron or a queue)
const expiredOrders = await prisma.order.findMany({
  where: { status: 'PENDING', expiresAt: { lt: new Date() } }
});

for (const order of expiredOrders) {
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.sellerListing.update({
        where: { id: item.sellerListingId },
        data: { reservedStock: { decrement: item.quantity } }
      });
    }
    await tx.order.update({ where: { id: order.id }, data: { status: 'EXPIRED' } });
  });
}
```

---

## Frontend Pages (Module 2)

| Page | Route | Who sees it |
|---|---|---|
| Product Listing | `/` or `/collection` | Everyone |
| Product Detail | `/product/:slug` | Everyone |
| Seller Dashboard | `/seller/dashboard` | SELLER only |
| Create Product | `/seller/products/new` | SELLER only |
| My Listings | `/seller/listings` | SELLER only |
| Cart | `/cart` | Logged-in users |
| Wishlist | `/wishlist` | Logged-in users |
| Seller Onboarding | `/seller/setup` | SELLER (no profile yet) |
| Admin Panel | `/admin/products` | ADMIN only |

---

## What Changes in Existing Files

### `schema.prisma`
- Add 11 new models + 4 enums
- Add 5 new relations to `User` model

### `env.ts`
- No new required vars (S3 for images is already stubbed in `.env`)

### `seed.ts`
- Seed: Category tree (Electronics, Clothing, Groceries), Brands, sample Product, sample SellerProfile

### New Route Files
- `seller.routes.ts`
- `product.routes.ts`
- `cart.routes.ts`
- `wishlist.routes.ts`
- `admin.product.routes.ts`

---

## Verification Plan

### Database
1. Run `npx prisma migrate dev --name module-2-commerce`
2. Open Prisma Studio — verify all 11 new tables
3. Verify `@@unique` on `SellerListing(sellerProfileId, variantId)` — try creating duplicate
4. Verify `@@unique` on `CartItem(cartId, sellerListingId)` — try adding same item twice

### Seed Test
```bash
npx prisma db seed
```
Should create:
- Category tree (3 levels)
- 2 Brands
- 1 Product with 2 Variants
- 1 SellerProfile
- 2 SellerListings (one per variant)

### Manual API Tests (Postman/curl)
1. Create seller profile → verify profile required before listing
2. Create product → verify `PENDING_REVIEW` status
3. Admin approves → verify status changes to `APPROVED`
4. Create seller listing on approved product → goes live instantly
5. Add to cart with quantity > available stock → verify `OUT_OF_STOCK` rejected, and confirm `reservedStock` is untouched
6. Add to cart with valid quantity → confirm `reservedStock` stays unchanged (this is the key regression test for the fix)
7. Remove from cart → confirm no stock side effects occur

---

## Notes / Known Simplifications (documented, not accidental)

- No search index (Elasticsearch/OpenSearch) yet — Postgres filtering is fine up to tens of thousands of products; revisit once catalog scales.
- No `PriceHistory` / listing audit trail yet — not needed for v1, add later for "price dropped" notifications or fraud detection.
- `Product.slug` uniqueness with soft-deleted rows: if a product is soft-deleted and a new one is created with the same name, the `@unique` constraint can collide. Fix later with a Postgres partial unique index excluding `deletedAt IS NOT NULL`, or append a suffix to `slug` on soft-delete.