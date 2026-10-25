---
name: cart-standardization
description: Comprehensive enterprise industry standard specifications, latency optimization blueprints (optimistic UI & debounced server sync), multi-vendor cart grouping, price change alerts, stock gatekeepers, and slide-over mini-cart drawer for AkMart.
---

# AkMart Cart & Mini-Cart Standardization Blueprint (Enterprise Grade)

This skill serves as the canonical audit guide, latency mitigation blueprint, and element-by-element implementation reference for the AkMart Cart and Mini-Cart ecosystem, adhering strictly to Tier-1 e-commerce benchmarks (Amazon, Flipkart, Shopify Plus, Stripe).

---

## 1. Latency & Performance Engineering Blueprint (Under 50ms Perceived Speed)

A cart is the most critical conversion bottleneck in an e-commerce platform. Laggy counters or slow quantity steppers cause checkout abandonment.

### The Latency Problem in Naive Implementations:
- **Sequential Network Lag**: In naive carts, every `+` or `-` click triggers an immediate HTTP `PUT /api/cart/items/:id`, waits for network round-trip (200ms–800ms), and then triggers a second `GET /api/cart` round-trip.
- **Button Freezing**: Users are locked out (`disabled={isUpdating}`) between clicks, making increasing quantity from 1 to 5 feel sluggish.
- **Database Strain**: Rapid clicks fire 4–5 consecutive database writes against PostgreSQL and recalculate totals repeatedly.

### The Tier-1 Solution: Optimistic UI + Debounced Server Sync

```
[User Clicks "+"]
       │
       ▼ (0ms)
[Optimistic Local State Update] ───► Instant 60fps UI re-render (Qty: 2 -> 3)
       │                        ───► Live Subtotal & Free Shipping meter update
       ▼
[Debounce Queue (400ms Window)]
       │
       ├── (User clicks "+" again within 400ms) ──► Reset timer, Qty: 3 -> 4
       │
       ▼ (Timer expires after 400ms of inactivity)
[Single Batch HTTP Request] ───► PUT /api/cart/items/:id { quantity: 4 }
       │
       ├── SUCCESS: Confirm state silently (zero jarring UI jumps).
       └── ERROR (e.g. Out of stock): Roll back optimistic state with toast alert:
           "Only 3 units left in stock. Quantity adjusted."
```

#### Key Rules:
1. **Perceived Latency**: **0ms** for the customer.
2. **Network Efficiency**: Reduces database writes by **70–80%** during cart edits.
3. **Optimistic Rollback**: Store previous valid state so any stock violation or network timeout can revert gracefully without corrupting user data.

---

## 2. Complete Element Inventory (Tier-1 Industry Standards)

The Cart ecosystem consists of two synchronized surfaces:
- **Surface A: The Cart Slide-Over Drawer (Mini-Cart)** (Instant storefront feedback on Add-to-Cart without leaving the page).
- **Surface B: The Full Cart Page (`/cart`)** (Deep management, multi-vendor grouping, coupon codes, and checkout preparation).

### Element-by-Element Specifications:

#### Header & Nav Triggers:
1. **Header Cart Icon & Badge**: Reactive counter reading `cartCount` from `ShopContext`. Bounces subtly on item addition.
2. **Mobile Bottom Nav Cart Tab**: Fixed 5-tab item with live notification badge.

#### Mini-Cart Slide-Over Drawer (Instant Feedback):
3. **Off-Canvas Slide-In Sheet**: Smooth right-to-left backdrop blur drawer when an item is added to cart.
4. **Added Item Confirmation Banner**: Micro-toast inside drawer (*"Added to cart!"*).
5. **Mini-Cart Item List**: Compact scrollable cards with thumbnail, variant badge, quantity stepper, and remove icon.
6. **Free Shipping Progress Meter**: Dynamic bar showing progress toward free shipping threshold (e.g., *"Add NPR 350 more for FREE Delivery!"*).
7. **Mini-Cart Subtotal & Checkout CTA**: Direct "Proceed to Checkout" button and "View Full Cart" link.

#### Full Cart Page (`/cart`):
8. **Multi-Vendor Seller Grouping**: Items grouped under their respective seller header (e.g., *Sold by: TechMart Nepal (★ 4.8)*).
9. **Variant Specification Chips**: Displays selected SKU attributes (e.g., *Color: Onyx Black | Storage: 256GB*).
10. **Price Snapshot vs Live Price Banner**:
    - Highlights if the item price was reduced or increased since the user placed it in cart.
11. **Live Stock Availability & Out-of-Stock Gatekeeper**:
    - Disables checkout or highlights items that exceed available inventory (`availableStock < quantity`).
12. **Optimistic Quantity Stepper (`-`, `qty`, `+`)**: Instantaneous local update with debounced server push.
13. **"Save for Later" / Move to Wishlist CTA**: 1-click button to move the item to Wishlist and remove from active cart subtotal.
14. **Direct Remove Trash Button**: Instant item deletion with undo option.
15. **Promo Code / Coupon Code Accordion**: Input field with instant client validation and discount deduction.
16. **Order Financial Summary Box**:
    - Item Subtotal (Gross MRP)
    - Retail Discount Savings (Green highlight: *"You saved NPR 850"*)
    - Delivery Fee (Dynamic: Free or standard NPR 100)
    - Net Payable Total
    - Trust Badges: *100% Secure Checkout • Cash on Delivery / Digital Wallets*
17. **Empty Cart State**: Welcoming illustration, informative copy, and prominent "Explore Trending Products" CTA button.

---

## 3. Multi-Vendor Marketplace Logic (Amazon / Flipkart Standard)

Because AkMart is a multi-vendor marketplace where multiple independent sellers fulfill orders:

1. **Seller Partitioning**:
   - Items in the cart should visually cluster by Seller.
   - Separate seller packages allow clear fulfillment transparency (e.g., *Seller A dispatches tomorrow from Lalitpur; Seller B dispatches in 2 days from Pokhara*).
2. **Delivery Fee Calculation**:
   - Industry Rule: Free shipping when order total exceeds threshold (e.g., NPR 2,500), otherwise standard fee applies.
3. **Merchant Role Protection**:
   - Sellers or Admins viewing `/cart` receive a clean informative banner:
     *"Signed in as SELLER. Consumer ordering is reserved for shopper accounts."* with 1-click navigation to their respective Dashboard.

---

## 4. Multi-Breakpoint Responsive Layout Matrix

| Breakpoint | Target Screen Width | Cart Page Layout | Mini-Cart Drawer |
|---|---|---|---|
| **Mobile (`< 640px`)** | Full single-column stack. Sticky bottom checkout bar (`Total: NPR X,XXX | Checkout →`) pinned above mobile bottom app bar. | Full-width slide-over with touch-friendly 44px stepper buttons. |
| **Tablet (`640px – 1024px`)** | Single column with generous 2-column summary card at the bottom. | 380px slide-over sheet with backdrop blur. |
| **Desktop (`1024px – 1440px`)** | Two-column asymmetric layout (65% item list on left, 35% sticky order summary on right). | 420px slide-over sheet. |
| **Ultrawide (`> 1440px`)** | Centered `max-w-7xl mx-auto px-8` preventing horizontal over-stretching. | 440px sheet. |

---

## 5. Implementation & Audit Checklist (Fully Verified & Certified)

- [x] **Step 1: Latency Engine & Guest Persistence in `ShopContext.tsx`**:
  - Implement optimistic `cart` state with debounced sync (400ms) and 0ms perceived latency.
  - Implement guest cart persistence via `localStorage` (`akmart_guest_cart`).
  - Implement zero-friction auto-merge of guest items into PostgreSQL cart upon user login.
  - Implement 1-click optimistic item removal with 5-second **"Undo"** restoration toast.
  - Implement stock-aware quantity capping (live inventory gatekeeper & 10-unit consumer limits).
- [x] **Step 2: Full Cart Page (`Cart.tsx`)**:
  - Dynamic Free Shipping Progress Meter with NPR 2,500 milestone.
  - Multi-Vendor Package Grouping (*Package X of Y: Sold by {shopName}* with dispatch estimates).
  - "Save for Later" 1-click transfer to Wishlist.
  - Price-change detection alerts (green price drop celebrations and yellow price hike notices).
  - Out-of-Stock checkout gatekeeper.
  - Promotional coupon engine (`AKMART10`, `FESTIVE500`) with auto-invalidation on subtotal drops.
  - Sticky mobile checkout bar above bottom navigation.
- [x] **Step 3: Mini-Cart Slide-Over Drawer (`CartDrawer.tsx`)**:
  - Reusable off-canvas sheet with backdrop blur, keyboard `Escape` closing, and body scroll lock.
  - Accessible via header cart button (`id="header-cart-btn"`), mobile bottom nav cart tab, and storefront "Add to Cart" triggers.
- [x] **Step 4: End-to-End Browser Verification**:
  - Tested guest item addition, instant drawer slide-in, and 0ms quantity stepper.
  - Tested full `/cart` package rendering, coupon code application, and 1-click Undo.
  - Tested unauthenticated checkout redirection to `/login?redirect=%2Fcheckout`.
  - Tested post-login auto-merge: guest items merged into account and forwarded to `/checkout`.
