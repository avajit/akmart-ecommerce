---
name: consumer-audit
description: Comprehensive audit checklist, architectural gap analysis, and bug fix blueprint for the AkMart Consumer Storefront, Catalog, Navigation, and Checkout experience.
---

# AkMart Consumer Section: Master Full-Stack Audit & Bug Checklist

This skill document outlines all identified bugs, UI/UX shortcomings, and architectural gaps in the AkMart Consumer flow compared to industry standards (Flipkart, Amazon, Daraz).

---

## 1. Executive Summary of Critical Consumer Bugs

| # | Component / Layer | Severity | Issue / Bug Description | Industry Standard (Flipkart / Amazon) |
|---|---|---|---|---|
| **BUG-01** | `NavBar.tsx` | **High** | Tiny search bar squished on the right; no live suggestions dropdown. | Central prominent search bar (45-55% width) with real-time autocomplete suggestions, category select, and clear button. |
| **BUG-02** | `NavBar.tsx` | **High** | Clunky vertical category dropdown with raw text arrows (`↳`). | Dedicated horizontal Flipkart-style **Category Strip** with high-resolution icons + hoverable Mega Menu. |
| **BUG-03** | `product.service.ts` | **Critical** | Category filter only matches exact `where.categoryId = cat.id`. Selecting parent categories ("Men", "Electronics") returns 0 products. | Recursive descendant category search: `where.categoryId = { in: [cat.id, ...childrenIds] }`. |
| **BUG-04** | `Collection.tsx` | **Critical** | Price sorting (`price-low`, `price-high`) is performed on client-side array slice after pagination, not in PostgreSQL query. | Server-side database sorting on `orderBy: { ... }` across the entire catalog. |
| **BUG-05** | `Collection.tsx` | **High** | No pagination controls; products cut off at arbitrary limit without Next/Prev or Page buttons. | Full pagination system (page numbers, items per page selector, total product count). |
| **BUG-06** | `Home.tsx` & DB | **Medium** | Categories hardcoded in frontend object (`CATEGORY_IMAGES`); small flat taxonomy with missing retail departments. | Rich multi-tier taxonomy (Mobiles, Electronics, Fashion, Home, Beauty, Appliances) dynamically driven from PostgreSQL with image fallback. |
| **BUG-07** | `Product.tsx` | **Medium** | Variant selection does not dynamically update image gallery, discount percentage badge, or out-of-stock badges. | Real-time variant switching: instant image switch, MRP strike-through, saving calculation (`Save NPR X (Y%)`). |
| **BUG-08** | `Cart.tsx` | **Medium** | Does not highlight price changes or live stock decreases while items sit in cart. | Visual alerts for stock limits ("Only 2 left!") and price modification warnings. |
| **BUG-09** | `Checkout.tsx` | **Medium** | Missing localized Nepal delivery fields (Province 1-7, District, Landmark) and payment badges (eSewa / Khalti / COD). | Structured Nepali address book with default address selector and branded payment options. |

---

## 2. File-by-File Detailed Audit & Action Plan

### Module 1: Navigation & Header Experience ([`NavBar.tsx`](file:///c:/akmart-ecommerce/Frontend/src/components/NavBar.tsx))
- [x] **Transform Search Bar into Central Anchor**:
  - Center the search bar in the header with flexible width (`max-w-2xl w-full`).
  - Add search icon, clear `(X)` button, and dedicated search submit button.
  - Implement **Live Search Autocomplete**: As user types (debounced 250ms), display floating dropdown with top 5 matching products (with thumbnails and price) + matching categories.
- [x] **Flipkart-Style Category Sub-Navigation Strip**:
  - Add secondary navigation bar directly beneath the top header for desktop.
  - Render top departments: *Mobiles & Tech*, *Men's Fashion*, *Women's Fashion*, *Electronics*, *Home & Living*, *Beauty*, *Groceries*.
  - Add smooth hover mega-menu showing grouped subcategories.
- [x] **Mobile Bottom Navigation Bar**:
  - Add fixed bottom navigation bar for mobile screens: `[ 🏠 Home ]` `[ 🗂️ Categories ]` `[ 💖 Wishlist ]` `[ 🛒 Cart (count) ]` `[ 👤 Account ]`.

---

### Module 2: Catalog, Searching & Filtering ([`Collection.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/Collection.tsx) & [`product.service.ts`](file:///c:/akmart-ecommerce/Backend/src/services/product.service.ts))
- [x] **Fix Parent Category Recursive Query in Backend**:
  - In `product.service.ts`, when a category slug is passed, retrieve the category and all its children/descendant IDs.
  - Query with `where.categoryId = { in: allCategoryIds }` so clicking "Electronics" shows smartphones, laptops, audio, etc.
- [x] **Move Sorting to Server-Side**:
  - Support `sort=price-low`, `sort=price-high`, `sort=newest`, `sort=name-asc`, `sort=name-desc` in `product.service.ts`.
  - Sort on the active seller listing price in SQL/Prisma so all pages reflect true ordering.
- [x] **Implement Catalog Pagination & Results Count**:
  - Display: *"Showing 1–12 of 142 products"*.
  - Add numbered pagination buttons `[ 1 ] [ 2 ] [ 3 ] ... [ Next > ]`.
- [x] **Filter Enhancements**:
  - Price quick brackets (`Under NPR 1,000`, `NPR 1,000 - 5,000`, `NPR 5,000 - 15,000`, `Above NPR 15,000`) + custom inputs.
  - In-stock only toggle checkbox/switch.
  - Searchable brand filter with active radio indicators.
  - Active filter pills with single-click remove `[ Category ✕ ] [ Brand ✕ ] [ Price ✕ ] [ In Stock ✕ ]`.
  - Mobile slide-over filter drawer with live counter badge and sticky action bar.

---

### Module 3: Category Taxonomy & Storefront ([`Home.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/Home.tsx) & `seed.ts`)
- [x] **Expand Category Taxonomy in Database Seed**:
  - Populated standard e-commerce departments (Men, Women, Kids, Home, Beauty, Electronics & Computers).
  - Seeded dynamic `CategoryAttributeConfig` for each department with recursive inheritance support.
- [x] **Dynamic Category Presentation**:
  - High-res category images stored directly in database `Category.imageUrl`.
  - Redis caching (`cache:category:tree`, `cache:category:filters:${slug}`) for instant lookups across 1,000+ categories.

---

### Module 4: Product Detail Page ([`Product.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/Product.tsx))
- [x] **Dynamic Multi-Axis Variant Switching**:
  - Flipkart/Amazon style attribute axes (e.g. Color Swatches, Size Pills, RAM/Storage buttons).
  - Real-time SKU, Price, MRP, Savings Calculation (`Save NPR X (Y% off)`), and Variant Photo updates.
- [x] **Stock Indicators**:
  - `In Stock` (Green live badge with pulse)
  - `Only X left - order soon` (Amber warning badge when stock <= 10)
  - `Out of Stock` (Red badge - disabled purchase buttons)
- [x] **Seller Offer Comparison**:
  - Show "Sold by [Seller Name]" with rating and stock status.
  - If multiple sellers list the same variant, list other offers with prices, seller names, and direct Add-to-Cart / Buy-Now buttons.
- [x] **Verified Reviews Section**:
  - Rating breakdown bar (5★, 4★, 3★, 2★, 1★) with progress percentages and 97% recommended badge.
  - Verified Purchase checkmark for customer reviews, filter pills (All / 5★ / 4★), helpful reaction counters, and interactive review submission modal.

---

### Module 5: Cart & Checkout Engine ([`Cart.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/Cart.tsx) & [`Checkout.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/Checkout.tsx))
- [x] **Cart State & Price Protection**:
  - Live price mutation warnings (`isPriceChanged`) and out-of-stock badges.
  - Checkout CTA guards against cart items exceeding current merchant stock.
- [x] **Localized Checkout**:
  - Nepali province dropdown (Provinces 1 to 7).
  - Popular Nepali cities dropdown + custom city selector.
  - 10-digit Nepali contact phone validation (`98XXXXXXXX` / `97XXXXXXXX`).
  - Branded Nepali payment channels: **Cash on Delivery (COD)**, **eSewa Mobile Wallet**, **Khalti Digital Wallet**.
- [x] **Atomic Order Creation**:
  - Prisma `$transaction` stock decrement with conditional `stock: { gte: item.quantity }` check preventing overselling.

---

### Module 6: Orders & Customer Profile ([`Orders.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/Orders.tsx) & [`Profile.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/Profile.tsx))
- [x] **Interactive Order Tracking Stepper**:
  - Flipkart/Amazon style progress line: `Order Placed` &rarr; `Confirmed` &rarr; `Out for Delivery` &rarr; `Delivered`.
  - Cancelled order state card with status notification.
- [x] **Order Cancellation with Automatic Stock Restoration**:
  - `PATCH /api/orders/:id/cancel` endpoint and UI button for `PENDING` / `CONFIRMED` orders.
  - Atomically increments merchant inventory stock upon customer cancellation.

---

## 3. Execution Sequence

```
Step 1: Fix Backend Category Hierarchy & Sorting Bugs (product.service.ts) [DONE]
   ↓
Step 2: Redesign Navigation Bar & Search with Live Autocomplete (NavBar.tsx) [DONE]
   ↓
Step 3: Perfect Collection Page Filters, Sorting & Server Pagination (Collection.tsx) [DONE]
   ↓
Step 4: Seed Comprehensive Multi-Department Taxonomy & Dynamic Attributes (seed.ts) [DONE]
   ↓
Step 5: Enhance Product Detail Page Variants & Stock Indicators (Product.tsx) [DONE]
   ↓
Step 6: Polish Cart, Localized Checkout & Orders Timeline (Cart.tsx, Checkout.tsx, Orders.tsx) [DONE]
   ↓
Step 7: Admin Category Attribute Studio (Categories.tsx) [DONE]
   ↓
Step 8: Seller Category-Aware Variant Attribute Form (CreateProduct.tsx) [DONE]
```

---

## 4. Phase 2: Admin & Seller Dynamic Taxonomy & Attribute Management (Post-Consumer Milestone)

### Module 7: Admin Category Attribute Studio ([`Categories.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/admin/Categories.tsx))
- [x] **Category Attribute Configuration Modal & Studio**:
  - Added "Attributes Studio" button on each category row in the Admin Categories table.
  - Interactive slide-over modal to inspect, add, and remove dynamic attributes per category.
  - Quick-preset buttons for one-click setup across 1,000+ categories (Fish/Meat: `weight` & `cut_type`; Produce: `pack_weight` & `is_organic`; Tech: `ram` & `storage`; Apparel: `size` & `material`).
  - Schema configuration fields:
    - **Attribute Key**: (e.g., `weight`, `cut_type`, `ram`, `material`)
    - **Display Label**: (e.g., "Pack Weight", "RAM", "Fabric")
    - **Filter Type**: (`MULTISELECT`, `RANGE`, `BOOLEAN`)
    - **Unit (Optional)**: (e.g., `kg`, `g`, `GB`, `Liters`, `inches`)
    - **Order**: Sorting priority in filters.
  - Connected to backend endpoints: `GET /api/admin/categories/:id/attributes`, `POST /api/admin/categories/:id/attributes`, `DELETE /api/admin/categories/:id/attributes/:attrId`.
  - Automatically invalidates Redis `cache:category:filters:${slug}` and `cache:category:tree` on save.

### Module 8: Seller Category-Aware Variant Attribute Form ([`CreateProduct.tsx`](file:///c:/akmart-ecommerce/Frontend/src/pages/seller/CreateProduct.tsx))
- [x] **Dynamic Variant Form Generator**:
  - When a seller selects any category (e.g., "Fresh Seafood", "Vegetables", "Smartphones", "Apparel"):
    - Automatically queries `GET /api/categories/:slugOrId/filters` with parent inheritance.
    - Dynamically renders input fields matching that category's specific attributes (e.g., Pack Weight, Cut Type, RAM, Storage, Size).
    - If options already exist in the catalog, provides datalist auto-complete hints.
  - Multi-Variant Support: Sellers can draft multiple variants with distinct SKUs, photos, and attribute combinations (e.g., 500g Curry Cut vs 1kg Fillet; 8GB/256GB vs 16GB/512GB).
  - Automatically packages attributes into each variant's JSON payload: `attributes: { weight: "1 kg", cut_type: "Curry Cut" }`.

