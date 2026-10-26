---
name: state-sync-qa-audit
description: Master QA, Alpha/Beta testing, state synchronization, cache invalidation, Zustand/React-Query alignment, and zero-stale-state audit playbook for AkMart.
---

# Master State Synchronization & QA Testing Playbook for AkMart

This skill provides the mandatory architectural guidelines, bug-fixing blueprints, and testing protocols to ensure **100% zero-stale-state synchronization** across Zustand, React Context, TanStack React Query, and LocalStorage in AkMart.

---

## 1. The Core Problem: Dual Sources of Truth & Stale UI Bugs

A classic e-commerce bug occurs when state lives in two disjointed layers:
- **Layer A (React Context / Local State)**: `ShopContext` maintains `cart`, `cartCount`, and `wishlistIds` in memory.
- **Layer B (TanStack React Query)**: `useQuery({ queryKey: ['cart'] })` caches responses in the React Query cache.
- **Layer C (Zustand)**: `useAuthStore` manages authentication and user tokens.

### The Symptom:
When a user checks out in `Checkout.tsx`:
1. `checkoutMutation` calls `queryClient.invalidateQueries({ queryKey: ['cart'] })`.
2. React Query marks its query stale, BUT `ShopContext`'s internal `cart` state is never updated or cleared.
3. The shopping bag icon in the navbar, the cart page, and the slide-over drawer continue reading `ShopContext.cart`, displaying old products until the user hard-refreshes (`F5`).

---

## 2. The Unified State Synchronization Architecture

### Rule 1: Instant Local Evacuation on Mutation
Every checkout mutation (whether COD, eSewa, or Khalti) must immediately:
1. Call `clearCartLocally(selectedItemIds)` in `ShopContext` to purge checked-out items at **0ms**.
2. Call `refreshCart()` to fetch the updated server snapshot.
3. Invalidate React Query keys: `['cart']`, `['my-orders']`.

### Rule 2: Synchronous LocalStorage & Guest Cart Purging
If a guest or authenticated user checked out items:
- Selective checkout: Filter out the checked-out item IDs from both server state and guest storage.
- Full checkout: Clear guest storage completely (`localStorage.removeItem('akmart_guest_cart')`).

### Rule 3: Session & Auth Synchronization
`useAuthStore` and Axios client must stay synchronized across page reloads:
- `setAccessToken` must sync both in-memory token and `sessionStorage.setItem('akmart_access_token', token)` to survive page transitions.
- `logout()` must purge `authStore`, clear `sessionStorage`, clear `queryClient`, and reset `ShopContext.cart` to null immediately.

---

## 3. White-Box Code Path Audit Matrix

| Component | State Source | Mutation Action | Required Invalidation / Sync |
| :--- | :--- | :--- | :--- |
| **`Checkout.tsx`** | `useMutation(checkout)` | Order created (COD / Online) | `clearCartLocally(selectedItemIds)` + `refreshCart()` + invalidate `['cart']`, `['my-orders']` |
| **`PlaceOrder.tsx`** | Location state + receipt | Mounts with order data | Verify cart count in navbar is 0; purge residual guest storage |
| **`Cart.tsx`** | `ShopContext.cart` | Qty update, remove, coupon | Optimistic state update + server debounce sync |
| **`Product.tsx`** | `addToCartOptimistic` | Add product variant | Instantly update `cartCount` in `NavBar` and show mini-cart |
| **`Wishlist.tsx`** | `toggleWishlist`, `moveToCart` | Move to cart / remove | Instantly update `wishlistCount` and `cartCount` |
| **`seller/Orders.tsx`** | `updateSellerOrderStatus` | Move status stepper | Invalidate `['seller-orders']` + optimistic local row update |
| **`seller/Listings.tsx`** | `updateListing` | Quick restock / price edit | Update local row state + sync availableStock |
| **`admin/Sellers.tsx`** | `verifySeller` / `rejectSeller` | Vendor KYC moderation | Invalidate `['admin-sellers']` + immediate local status update |

---

## 4. Black-Box Alpha & Beta Testing Protocols

### Test Suite 1: Cart-to-Checkout State Evacuation (The User's Reported Bug)
1. Add any product variant to cart (e.g. 1 unit).
2. Verify Navbar cart badge shows `1`.
3. Open `/checkout` and place order (COD or Online Gateway simulation).
4. On redirect to `/place-order`:
   - **PASS CRITERIA**: Navbar cart badge MUST immediately show `0`.
   - **PASS CRITERIA**: Visiting `/cart` MUST immediately display the empty cart state with "Your shopping cart is currently empty" without requiring a page refresh.
   - **PASS CRITERIA**: Visiting `/orders` MUST immediately list the newly placed order.

### Test Suite 2: Selective Checkout Sync
1. Add 2 distinct items (Item A and Item B) to cart.
2. Uncheck Item B in Cart and click "Checkout Selected Item (1)".
3. Complete checkout for Item A.
4. **PASS CRITERIA**: Navbar cart badge MUST update to `1`.
5. **PASS CRITERIA**: Visiting `/cart` MUST show ONLY Item B. Item A must be completely removed.

### Test Suite 3: Wishlist-to-Cart Synergy
1. Click heart icon on a catalog item.
2. Verify Navbar wishlist badge increases to `1`.
3. Open `/wishlist` and click "Move to Cart".
4. **PASS CRITERIA**: Wishlist count decreases to `0`, Cart count increases to `1`.
5. **PASS CRITERIA**: Zero page reload required.

### Test Suite 4: Seller Fulfillment State Stepper
1. Log in as seller (`seller@techmart.com`).
2. Open `/seller/orders`.
3. Click "Accept & Process" on a pending order item.
4. **PASS CRITERIA**: Stepper progress advances to step 2 ("Packed & Ready"), status badge switches to `PROCESSING` with 0 UI flicker.

### Test Suite 5: Admin KYC Moderation
1. Log in as admin (`admin@akmart.com`).
2. Open `/admin/sellers`.
3. Click "Inspect KYC" to expand banking and PAN credentials.
4. Click "Verify & Approve".
5. **PASS CRITERIA**: Merchant status badge turns to `VERIFIED` and count increases in Verified tab immediately.

---

## 5. Verification Commands
Always verify that changes introduce 0 regressions:
```bash
# Frontend Typecheck
cd Frontend && npx tsc --noEmit

# Frontend Lint
npm run lint

# Backend Typecheck
cd ../Backend && npx tsc --noEmit
```
Both typecheck and lint must pass with **0 errors**.
