---
name: ecommerce-audit
description: Comprehensive full-stack audit workflow for akmart-ecommerce. Systematically inspects Backend (Prisma, controllers, routes, middleware, error handling) and Frontend (React/TS components, API services, payload matching, UI/UX error toasts), verifying industry standards, bug fixes, and phase 2 readiness.
---

# Master Full-Stack Audit & Fix Playbook for AkMart E-Commerce

Use this systematic audit workflow to inspect, debug, and fix every single file in `akmart-ecommerce`, ensuring production readiness for Phase 2 deployment.

---

## 1. Industry Standard Standards to Enforce

### Backend API Response Contract
All endpoints must strictly return a unified envelope structure:
* **Success**:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```
* **Error**:
  ```json
  {
    "success": false,
    "message": "Human-readable error description for user display",
    "errors": [ ... ]
  }
  ```
* **HTTP Status Codes:**
  * `200` OK / `201` Created
  * `400` Bad Request (Zod / DTO validation failure)
  * `401` Unauthorized (Missing, expired, or invalid JWT)
  * `403` Forbidden (Insufficient role permissions: Consumer vs Seller vs Admin)
  * `404` Not Found (Resource does not exist)
  * `429` Too Many Requests (Rate limiter / Brute-force protection)
  * `500` Internal Server Error (Uncaught database or runtime error)

### Frontend Error & UI/UX Standard
* **No Silent Failures:** Every `catch` block or Axios response interceptor must trigger a toast notification (e.g. `toast.error(error.response?.data?.message || 'Something went wrong')`).
* **Loading Indicators:** Submit buttons, add-to-cart buttons, and checkout actions must enter a loading state and disable double-clicks while the request is pending.
* **Empty States:** When arrays are empty (`cart.length === 0`, empty wishlist, no order history), show a dedicated empty state graphic and a *"Continue Shopping"* button.
* **Full TypeScript Compliance:** `npx tsc --noEmit` must pass with 0 errors across both Backend and Frontend.

---

## 2. File-by-File Audit & Checklist

### Module 1: Database & Backend Architecture
- [ ] `Backend/prisma/schema.prisma`
  - Verify relations: User, Role, Product, Category, Cart, CartItem, Order, OrderItem, Review, Wishlist, Session.
  - Verify indexes on frequently queried fields (`slug`, `userId`, `categoryId`, `createdAt`).
  - Verify cascade deletes on CartItem and OrderItem.
- [ ] `Backend/src/config/`
  - Verify environment variable parsing (Zod schema checking `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_URL`, `PORT`).
- [ ] `Backend/src/middlewares/`
  - `auth.middleware.ts`: Verifies Bearer JWT, handles token expiry properly, attaches `req.user`.
  - `role.middleware.ts`: Enforces RBAC (`CONSUMER`, `SELLER`, `ADMIN`).
  - `error.middleware.ts`: Catches all Zod/Prisma/Express errors and outputs unified `{ success: false, message, errors }`.
  - `rateLimit.middleware.ts`: Rate limiting on auth endpoints (login, register, verify-otp).

### Module 2: Backend Routes & Controllers
- [ ] `src/routes/auth.routes.ts` & `src/controllers/auth.controller.ts`
  - `/register`: Email/phone verification, password hashing with bcrypt, OTP generation.
  - `/login`: Check account verified, strict DTO return (NEVER leak passwordHash).
  - `/verify-account` & `/verify-otp`: Secure OTP expiry and brute-force protection.
  - `/refresh-token`: Refresh rotation with httpOnly cookie or payload check.
  - `/google`: OAuth validation and auto-account creation.
- [ ] `src/routes/product.routes.ts` & `src/controllers/product.controller.ts`
  - Listing, pagination, search, category filter, price range.
  - Seller product creation, draft status, and Admin approval flow.
- [ ] `src/routes/category.routes.ts` & `src/controllers/category.controller.ts`
  - Category tree, parent-child relations, slug generation.
- [ ] `src/routes/cart.routes.ts` & `src/controllers/cart.controller.ts`
  - Add to cart, update quantity, remove item, clear cart.
- [ ] `src/routes/wishlist.routes.ts` & `src/controllers/wishlist.controller.ts`
  - Toggle item, list wishlist items, bulk move to cart.
- [ ] `src/routes/order.routes.ts` & `src/controllers/order.controller.ts`
  - Place order, stock deduction transaction, order status history (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED).
- [ ] `src/routes/seller.routes.ts` & `src/controllers/seller.controller.ts`
  - Seller onboarding, inventory management, earnings summary.
- [ ] `src/routes/admin.routes.ts` & `src/controllers/admin.controller.ts`
  - User management, product approvals, platform analytics.

### Module 3: Frontend API Services & Integration (`Frontend/src/api/`)
- [ ] `client.ts`: Axios client with base URL (`VITE_API_URL`), request interceptor for JWT token injection, response interceptor for unified 401 handling / auto-logout.
- [ ] `auth.service.ts`: Matches `/api/v1/auth/` payload structures exactly.
- [ ] `consumer.api.ts`: Matches product listing, categories, cart, and wishlist APIs.
- [ ] `order.api.ts`: Matches `/api/v1/orders/` payload and checkout schemas.
- [ ] `seller.api.ts`: Matches seller endpoints and inventory schemas.
- [ ] `admin.api.ts`: Matches admin approval and user management endpoints.

### Module 4: Frontend Pages & Components (`Frontend/src/pages/`)
- [ ] `Home.tsx`: Hero banners, featured categories, top deals, responsive product grids.
- [ ] `Collection.tsx`: Product filters, sorting (price low-high, high-low, newest), search query sync.
- [ ] `Product.tsx`: Image gallery, variant/size picker, quantity selector, add to cart, user reviews.
- [ ] `Cart.tsx`: Item list, quantity increment/decrement, coupon input, subtotal and shipping calculation.
- [ ] `PlaceOrder.tsx` / `Checkout.tsx`: Shipping address form, payment method selector (COD, Stripe, UPI), order confirmation.
- [ ] `Orders.tsx`: Order history list, status badges, tracking details, reorder button.
- [ ] `Wishlist.tsx`: Saved items grid, move-to-cart button, remove action.
- [ ] `Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `VerifyOTP.tsx`: Form validation, error feedback, OTP timer and resend button.
- [ ] `Profile.tsx`: User profile details, update name/phone, saved addresses, change password.
- [ ] `admin/` & `seller/`: Dashboard views, product approval tables, order fulfillment status updates.

---

## 3. Automated Verification & Fix Loop

Execute after every module fix:

```bash
# 1. Typecheck & Test Backend
cd Backend
npx tsc --noEmit
npm test

# 2. Typecheck & Build Frontend
cd ../Frontend
npx tsc --noEmit
npm run build
```

Iterate until both `npx tsc --noEmit` and all unit/integration tests pass with **0 errors**.
