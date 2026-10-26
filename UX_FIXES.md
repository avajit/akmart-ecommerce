# UX Fixes Tracking Log

| Issue ID | Description | File(s) Changed | What Was Done & Why | Before / After Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UI-003** | Missing "Skip to main content" link for keyboard navigation (WCAG 2.4.1 Bypass Blocks). | `Frontend/src/layouts/ConsumerLayout.tsx` | Added skip-to-content bypass anchor positioned at top with `sr-only focus:not-sr-only` to allow keyboard users to jump straight to `#main-content`. | Before: Keyboard users tabbed through 20+ nav links. After: First tab targets "Skip to content" button with high-contrast orange badge. | Fixed |
| **UI-004** | Promo code input lacks `aria-label` or `<label>` element (WCAG 3.3.2). | `Frontend/src/pages/Cart.tsx` | Added `aria-label="Promotional Coupon Code"` to coupon input element. | Before: Screen readers announced plain input without label context. After: Explicit accessible label announced on focus. | Fixed |
| **UI-001** | Hardcoded synthetic reviews & static star ratings in component state; review submission does not call backend API. | `Frontend/src/pages/Product.tsx` | Hooked TanStack React Query (`useQuery` / `useMutation`) to backend `GET /api/v1/products/:id/reviews` and `POST /api/v1/products/:id/reviews`. Replaced hardcoded static reviews with dynamic computations (real average rating, real star progress bars, filter pills, positive recommendation %), empty state ("No Customer Reviews Yet"), and accessible review modal with complete states (min-h 44px, focus-visible rings, loading spinner). | Before: Hardcoded "4.8 based on 148 ratings" even for 0-review products; modal did not call backend API. After: Dynamic real-time calculation; verified across 375px/768px/1440px ([`ux-fixes/UI-001_product_reviews_mobile_after.png`](file:///c:/akmart-ecommerce/ux-fixes/UI-001_product_reviews_mobile_after.png)). | Fixed |
| **UI-002** | Subtext `#6B7280` (`text-gray-500`) has 3.8:1 contrast on `#141414`, failing WCAG 2.1 AA 4.5:1 ratio. | `Frontend/src/pages/Orders.tsx`, `Frontend/src/pages/Cart.tsx`, `Frontend/src/pages/Product.tsx`, `Frontend/src/pages/PlaceOrder.tsx`, `Frontend/src/pages/Checkout.tsx` | Upgraded `text-gray-500` to `text-gray-400` (`#9ca3af`) across order tracking stepper, cart department headers, items action buttons, SKU codes, and checkout notices to achieve 6.1:1 contrast ratio. | Before: 3.8:1 contrast ratio washed out small 10px captions. After: 6.1:1 ratio, fully compliant with WCAG 2.1 AA ([`ux-fixes/UI-002_cart_mobile_after.png`](file:///c:/akmart-ecommerce/ux-fixes/UI-002_cart_mobile_after.png)). | Fixed |
| **UI-005** | Header icon button touch targets `w-10 h-10` (40px) below WCAG 2.5.5 minimum (44x44px). | `Frontend/src/components/NavBar.tsx` | Upgraded icon buttons (search, wishlist, cart, and mobile menu toggle) to `w-11 h-11 min-w-[44px] min-h-[44px]` with keyboard focus rings. | Before: 40x40px touch targets. After: Full 44x44px touch targets satisfying Apple HIG and WCAG 2.5.5 ([`ux-fixes/UI-005_mobile_header_after.png`](file:///c:/akmart-ecommerce/ux-fixes/UI-005_mobile_header_after.png)). | Fixed |
| **UI-006** | Coupon remove button has `title="Remove coupon"` but lacks `aria-label`. | `Frontend/src/pages/Cart.tsx` | Added explicit `aria-label="Remove coupon"` to coupon chip remove button. | Before: Missing accessible label on icon button. After: Screen readers announce "Remove coupon". | Fixed |

---

## Future Phase Feature Backlog (Deferred by Design)
1. **Customer Review Image Attachments:** Enable photo and media file uploads during customer review submissions. (Prisma schema update + Multer / S3 / Cloudinary asset storage integration scheduled for next phase).

---

## Skipped or Subjective Issues Log
*None skipped. All Critical, High, and actionable Low issues from Phase 11 UI/UX audit are fully resolved.*

