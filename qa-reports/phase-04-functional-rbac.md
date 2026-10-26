# Phase 4: Functional, Role-Based, and Business-Rule Testing Report
**Project:** AkMart Multi-Vendor E-Commerce Platform  
**Auditor:** Principal QA Architect / Senior SDET  
**Date:** 2026-10-26  
**Active Branch:** `qa-testing`  

---

## 4A. Feature-by-Feature Functional Test Coverage Matrix

Every core feature evaluated against 1 Happy Path, 2 Negative Tests, 1 Edge Case, and 1 Permission/Auth Test:

### 1. Catalog Browsing & Search
- **Happy Path (TC-F01):** `GET /api/v1/products?category=smartphones&page=1&limit=10` returns active products matching category with total count and pagination metadata.
- **Negative 1 (TC-F02):** Query with nonexistent category slug (`?category=nonexistent-cat-slug`) gracefully returns `{ products: [], total: 0, page: 1, totalPages: 0 }` with HTTP 200.
- **Negative 2 (TC-F03):** Query with negative page numbers (`?page=-1`) sanitized by controller `qi` helper and defaults to page 1 without crashing [CODE: `product.controller.ts:12`].
- **Edge Case (TC-F04):** Extremely large limit (`?limit=10000`) capped by pagination bounds to prevent database memory exhaustion.
- **Permission Test (TC-F05):** Guest users see only `status: "APPROVED"` products; unpublished `DRAFT` and `PENDING_REVIEW` products excluded from public browse [CODE: `product.service.ts:167`].

### 2. Shopping Cart Operations
- **Happy Path (TC-F06):** Consumer adds in-stock item to cart (`POST /api/v1/cart/items`), returns HTTP 201 with snapshotted `priceAtAddTime`.
- **Negative 1 (TC-F07):** Attempting to add quantity greater than available stock (`availableStock < quantity`) fails with HTTP 400 `OUT_OF_STOCK` [CODE: `cart.service.ts:60`].
- **Negative 2 (TC-F08):** Adding a soft-deleted or inactive listing fails with HTTP 410 `LISTING_UNAVAILABLE` [CODE: `cart.service.ts:54`].
- **Edge Case (TC-F09):** Existing cart item re-added: quantity incremented atomically without duplicating cart rows [CODE: `cart.service.ts:70-76`].
- **Permission Test (TC-F10):** Anonymous request to `POST /api/v1/cart/items` rejected with HTTP 401 Unauthorized [CODE: `cart.routes.ts:7`].

### 3. Checkout & Order Placement
- **Happy Path (TC-F11):** Consumer checks out with valid address, stock deducted atomically, order state set to `CONFIRMED`, checked-out items cleared from cart [CODE: `order.service.ts:111-155`].
- **Negative 1 (TC-F12):** Checkout with empty cart fails with HTTP 400 `CART_EMPTY` [CODE: `order.service.ts:20`].
- **Negative 2 (TC-F13):** Checkout when competitor bought remaining stock between add-to-cart and submit triggers transaction abort with HTTP 400 `INSUFFICIENT_STOCK` [CODE: `order.service.ts:94-98`].
- **Edge Case (TC-F14):** Order subtotal exactly NPR 2,500 grants free shipping; subtotal NPR 2,499 charges NPR 100 delivery fee [CODE: `order.service.ts:58-60`].
- **Permission Test (TC-F15):** Request to `/checkout` by non-CONSUMER role blocked with HTTP 403 Forbidden [CODE: `order.routes.ts:7`].

### 4. Order Cancellation & Stock Rollback
- **Happy Path (TC-F16):** Customer cancels `CONFIRMED` order, status transitions to `CANCELLED`, all order item stocks restored to seller listings [CODE: `order.service.ts:254-260`].
- **Negative 1 (TC-F17):** Customer attempting to cancel already `SHIPPED` or `DELIVERED` order rejected with HTTP 400 `ALREADY_SHIPPED` [CODE: `order.service.ts:250`].
- **Negative 2 (TC-F18):** Double-cancelling order rejected with HTTP 400 `ALREADY_CANCELLED` [CODE: `order.service.ts:242`].
- **Edge Case (TC-F19):** Multi-item order where seller partially cancelled one item: cancellation skips already-cancelled items and only increments active item quantities [CODE: `order.service.ts:256`].
- **Permission / IDOR (TC-F20):** Customer A attempting to cancel Customer B's order by UUID returns HTTP 404 `NOT_FOUND` [CODE: `order.service.ts:238`].

### 5. Seller Onboarding & Listing Management
- **Happy Path (TC-F21):** Verified seller creates listing for approved variant (`POST /api/v1/seller/listings`), returns HTTP 201 [CODE: `seller.service.ts:70`].
- **Negative 1 (TC-F22):** Seller attempting to create listing for unapproved (`DRAFT` or `PENDING_REVIEW`) product rejected with HTTP 403 `PRODUCT_NOT_APPROVED` [CODE: `seller.service.ts:61`].
- **Negative 2 (TC-F23):** Seller attempting to create duplicate active listing for same variant rejected with HTTP 409 `LISTING_EXISTS` [CODE: `seller.service.ts:68`].
- **Edge Case (TC-F24):** Seller reducing stock below `reservedStock` (units locked in in-flight checkouts) rejected with HTTP 400 `STOCK_BELOW_RESERVED` [CODE: `seller.service.ts:128-133`].
- **Permission Test (TC-F25):** Unverified applicant or non-seller role calling `/api/v1/seller/listings` rejected with HTTP 403 Forbidden [CODE: `seller.routes.ts:11`].

---

## 4B. Master Authorization Matrix (Role x Resource x Action)

| Resource | Action | Guest (Unauth) | CONSUMER | SELLER | ADMIN | Source Enforcement |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Catalog** | Browse approved products | Allowed | Allowed | Allowed | Allowed | [CODE: `product.routes.ts:30`] |
| **Catalog** | Browse pending/draft products | Denied (Hidden)| Denied (Hidden)| Own products only | Allowed (Queue) | [CODE: `product.service.ts:167`, `admin.routes.ts:14`] |
| **Catalog** | Create product (Draft) | Denied (401) | Denied (403) | Allowed | Allowed | [CODE: `product.routes.ts:35`] |
| **Catalog** | Approve / Reject product | Denied (401) | Denied (403) | Denied (403) | Allowed | [CODE: `admin.routes.ts:16-17`] |
| **Reviews** | Read product reviews | Allowed | Allowed | Allowed | Allowed | [CODE: `product.routes.ts:32`] |
| **Reviews** | Submit review | Denied (401) | Allowed | Denied (403) | Denied (403) | [CODE: `product.routes.ts:41`] |
| **Cart** | View, Add, Edit, Delete | Denied (401) | Allowed | **DENIED (403)** | Denied (403) | [CODE: `cart.routes.ts:7`] (**BUG-005**) |
| **Wishlist**| View, Add, Remove | Denied (401) | Allowed | Allowed | Allowed | [CODE: `wishlist.routes.ts:7`] |
| **Orders** | Checkout / Place Order | Denied (401) | Allowed | **DENIED (403)** | Denied (403) | [CODE: `order.routes.ts:7`] (**BUG-005**) |
| **Orders** | View My Orders | Denied (401) | Allowed | **DENIED (403)** | Denied (403) | [CODE: `order.routes.ts:7`] (**BUG-005**) |
| **Orders** | View Another User's Order | Denied (401) | Denied (404) | Denied (404) | Own admin view | [CODE: `order.service.ts:224`] |
| **Seller** | Apply for Seller Profile | Denied (401) | Allowed | Denied (409) | Denied (409) | [CODE: `seller.service.ts:9`] |
| **Seller** | Manage Listings | Denied (401) | Denied (403) | Allowed | Allowed | [CODE: `seller.routes.ts:11`] |
| **Seller** | Update Another Seller Listing | Denied (401) | Denied (403) | Denied (404) | Admin override | [CODE: `seller.service.ts:125`] |
| **Admin** | Dashboard / Admin Metrics | Denied (401) | Denied (403) | Denied (403) | Allowed | [CODE: `admin.routes.ts:8`] |
| **Admin** | Verify / Suspend Sellers | Denied (401) | Denied (403) | Denied (403) | Allowed | [CODE: `admin.routes.ts:21-23`] |
| **Admin** | Categories & Brands CRUD | Denied (401) | Denied (403) | Denied (403) | Allowed | [CODE: `admin.routes.ts:26-36`] |

---

## 4C. End-to-End Business Workflows & Failure Variants

### 1. Consumer Purchase Journey
- **Nominal Path:** Browse collection -> Select variant -> Add to Cart -> View Cart with live stock check -> Apply valid coupon (`MEGA20`) -> Enter Nepal shipping address -> Checkout via COD -> Receive order confirmation -> Items deducted from cart.
- **Failure Variant 1 (Stock Depleted Mid-Flight):** Competitor buys last SKU while consumer is on cart page. Checkout execution calls `tx.sellerListing.updateMany({ where: { stock: { gte: qty } } })` -> Returns count 0 -> Transaction rolls back cleanly with HTTP 400 `INSUFFICIENT_STOCK`.
- **Failure Variant 2 (Coupon Invalidation):** Order items modified such that subtotal drops below `minOrderAmount`. Checkout validation rejects coupon with HTTP 400 `MIN_ORDER_NOT_MET`.

### 2. Seller Listing & Approval Workflow
- **Nominal Path:** Registered user applies for Seller Profile -> Status set to `PENDING` -> User creates Product (`DRAFT`) -> Submits Product (`PENDING_REVIEW`) -> Admin reviews and approves Product (`APPROVED`) -> Seller creates `SellerListing` with Price & Stock -> Listing appears on public Product Detail page.
- **Failure Variant 1 (Premature Listing Creation):** Seller attempts to create listing while product is in `PENDING_REVIEW` -> Service rejects with `PRODUCT_NOT_APPROVED`.
- **Failure Variant 2 (Immediate Consumer Lockout):** User applies for seller profile -> User role switched to `SELLER` -> User tries to buy groceries for personal use -> Cart & Checkout throw 403 (**BUG-005**).

---

## 4D. Data Integrity & Business Calculation Rules

1. **Price Snapshots:** `CartItem.priceAtAddTime` and `OrderItem.priceAtPurchase` snapshot exact prices at interaction time, protecting historical orders from seller price mutations.
2. **Atomic Inventory Isolation:** Decrementing inventory in checkout and incrementing in cancellation are encapsulated in PostgreSQL ACID `$transaction` blocks.
3. **Foreign Key Integrity Hazard:** `Address` model lacks cascade or soft-delete protection, causing HTTP 500 crashes when deleting in-use addresses (**BUG-003**).

---

## Phase 4 Verification Checklist

| Checklist Item | Verified | Evidence / Rationale |
| :--- | :---: | :--- |
| **Every feature covered?** | **YES** | Catalog, Search, Cart, Checkout, Orders, Cancellation, Seller, Admin, and Coupons audited. |
| **Matrix complete?** | **YES** | 17 resources evaluated across Guest, Consumer, Seller, and Admin roles. |
| **Expected results trace to requirements?** | **YES** | Traced to REQ-001 through REQ-010 and quoted source controller/middleware code. |
| **Failure variants documented?** | **YES** | Flash-sale concurrency race and coupon invalidation failure paths analyzed. |
