---
name: uiux-mastery
description: Industry-standard UI/UX consistency, mobile responsiveness, micro-interaction standards, visual hierarchy, and component design blueprint for AkMart.
---

# AkMart UI/UX & Responsive Design System: Master Blueprint

This skill serves as the canonical design and responsive implementation reference for AkMart. It enforces enterprise-grade visual standards matching industry leaders (Flipkart, Amazon, Apple, Stripe) with deep localization for the Nepali e-commerce ecosystem.

---

## 1. Design System Tokens & Foundations

### 1.1 Color Palette
- **Canvas / Root Background**: `#0D0D0D` (Deep rich obsidian, avoiding harsh 100% black `#000000` to prevent OLED smear and harsh contrast).
- **Surface / Card Backgrounds**:
  - Primary Surface: `#141414` (Elevated card containers, panels, modals).
  - Secondary Surface: `#1A1A1A` / `#1F1F1F` (Inputs, sub-cards, nested rows, image wells).
  - Floating Bar Background: `#111111/95` with `backdrop-blur-md` (Top header and mobile bottom navigation).
- **Brand Accent (Primary)**:
  - Base: `#F97316` (`orange-500`)
  - Hover: `#EA580C` (`orange-600`)
  - Subtle Tint / Glow: `rgba(249, 115, 22, 0.12)` (`bg-orange-500/10`)
  - Border Highlight: `rgba(249, 115, 22, 0.35)` (`border-orange-500/35`)
- **Neutral Borders**:
  - Default: `border-gray-800/80` or `border-white/5`
  - Subtle: `border-gray-800/40`
  - Interactive Hover: `hover:border-orange-500/50` or `hover:border-gray-700`
- **Text & Contrast Hierarchy**:
  - Primary (Headings, active prices, labels): `#FFFFFF` (`text-white`)
  - Secondary (Body copy, details, subheaders): `#D1D5DB` (`text-gray-300`)
  - Muted (Metadata, dates, descriptions): `#9CA3AF` (`text-gray-400`)
  - Dimmed (Disclaimers, secondary icons): `#6B7280` (`text-gray-500`)

### 1.2 Typography
- **Primary Font**: `Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- **Hero & Display Font**: `Oswald, Poppins, sans-serif` for high-impact editorial hero headings.
- **Numbers / Currencies / SKUs**: Monospace or bold tracking (`font-mono` or `font-extrabold tracking-tight`).

### 1.3 Geometric Radii Hierarchy
- **Pills, Badges & Small Controls**: `rounded-lg` (8px) or `rounded-xl` (12px).
- **Action Buttons & Inputs**: `rounded-xl` (12px) (uniform across all forms).
- **Cards & Product Containers**: `rounded-2xl` (16px).
- **Modals, Sheets & Hero Boxes**: `rounded-3xl` (24px).

---

## 2. Iconography & Anti-Emoji Standards

### 2.1 The Zero-Emoji Mandate
Raw platform emojis (`🏠`, `💻`, `👗`, `🧸`, `⚠️`, `📞`, `🎉`) render with wild visual differences across Android, iOS, Windows, and macOS, creating an amateur "AI generated" feel.
- **Rule**: Never use raw emojis in core UI buttons, category navigation strips, status alerts, or inputs.
- **Standard**: Always use curated SVG vector icons from `react-icons/fi` (Feather Icons) or `react-icons/ri` (Remix Icons).

### 2.2 Category & Navigation Disambiguation
- **Website Root Homepage**: `<FiHome />` (Labeled "Home").
- **Furniture / Interior Department**: Custom vector `<HomeLivingIcon />` (Labeled "Home & Living" to prevent consumer confusion with the website homepage).
- **Tech / Electronics**: `<FiCpu />` or `<FiMonitor />`.
- **Fashion**: `<FiUser />` (Men), `<FiShoppingBag />` (Women), `<FiSmile />` (Kids).

---

## 3. Responsive Breakpoints & Layout Architecture

| Viewport Range | Target Devices | Grid Specifications | Navigation Layout |
|---|---|---|---|
| **< 640px** (Mobile) | iPhone SE, 13/14/15/16, Samsung Galaxy | 2 columns for products & categories (`grid-cols-2 gap-3.5`). Stack forms vertically. | Fixed bottom navigation bar (`fixed bottom-0 z-40`). Header collapses to compact search + cart. |
| **640px – 1024px** (Tablet) | iPad, Tablets | 3 columns (`grid-cols-3 gap-5`). | Collapsible drawer menu + top search bar. |
| **1024px – 1440px** (Desktop) | Laptops, Desktops | 4 columns (`grid-cols-4 gap-6`). Sticky sidebar filter. | Central 55% search bar, category sub-navigation strip. |
| **> 1440px** (Wide Screen) | 27"+ Monitors, Ultrawide | 4–5 columns (`grid-cols-4 xl:grid-cols-5 gap-6`). Maximum content width `max-w-7xl mx-auto`. | Full mega-menus, live autocomplete dropdown. |

### 3.1 Mobile Safe-Area & Floating Clearance
- Because the mobile bottom navigation bar is fixed at the bottom (`height: ~60px`, `z-40`), all page layouts MUST guarantee clearance:
  - `Footer.jsx` has `pb-28 md:pb-12` so all links and social badges are never blocked.
  - Modals and drawers must have `z-50` and safe bottom padding `pb-6`.
  - Floating sticky CTA bars must sit above the navigation bar or be integrated smoothly.

---

## 4. Component-by-Component Polish Checklist

### 4.1 Header & Navigation (`NavBar.tsx`)
- [x] Vector SVG icons on the category strip with no text clipping.
- [x] Clear disambiguation between Website Home (`FiHome`) and Home & Living category (`HomeLivingIcon`).
- [x] Responsive debounced autocomplete search with product thumbnails and category shortcuts.
- [x] Cart counter badge with vibrant orange background and bold white font.
- [x] Mobile bottom bar with touch-friendly 44px min height.

### 4.2 Hero Banner (`Hero.jsx`)
- [x] Scaled responsive typography (`text-4xl sm:text-6xl md:text-7xl lg:text-8xl`).
- [x] Ambient glowing circular backdrop behind the hero image (`blur-[80px]`).
- [x] Rounded-xl CTA button with micro-scaling on tap (`active:scale-95`).

### 4.3 Catalog & Filter Drawer (`Collection.tsx`)
- [x] 2-column mobile grid, 4-column desktop grid with 4:5 aspect ratio image containers.
- [x] Desktop sticky filter sidebar (`sticky top-24`).
- [x] Mobile slide-over drawer with backdrop blur and sticky Done/Reset action footer.
- [x] Dynamic attribute facet pills (Size, Color, RAM, Storage).
- [x] Numbered server pagination with ellipsis logic preventing mobile horizontal overflow.

### 4.4 Product Details (`Product.tsx`)
- [x] 4:5 aspect ratio primary gallery with dynamic discount badge (`X% OFF`).
- [x] Multi-axis variant pills with instant stock check and active orange ring.
- [x] Amazon/Flipkart standard Verified Shopper Feedback with star rating distribution bars.
- [x] High-contrast Buy Now and Add to Cart action buttons with loading spinners.

### 4.5 Shopping Bag & Checkout (`Cart.tsx` & `Checkout.tsx`)
- [x] Visual stock alert warnings using `<FiAlertTriangle />` instead of emojis.
- [x] Stepper quantity controls with disabled states at stock limits.
- [x] Structured Nepali address form (Province 1–7, District/City, Street & Landmark, Nepali phone validation).
- [x] Branded Nepali payment channels: Cash on Delivery (COD), eSewa Mobile Wallet, Khalti Digital Wallet.
- [x] Sticky order summary card with free delivery threshold indicator.

### 4.6 Tracking & Orders (`Orders.tsx`)
- [x] Interactive visual tracking stepper (`Order Placed` -> `Confirmed` -> `Out for Delivery` -> `Delivered`).
- [x] Responsive text wrapping on tracking labels so narrow phones (375px) never collide text.
- [x] Status badges with distinct color-coded indicators.

### 4.7 Informational Pages (`About.tsx`, `Contact.tsx`, `Refund.tsx`)
- [x] Fully designed, localized dark-mode pages preventing any 404 dead ends.
- [x] 7-Day return and refund policy with direct wallet refund timelines.
- [x] Working contact form and Kathmandu headquarters location details.

---

## 5. Verification & Testing Workflow

Before declaring any UI/UX or responsive task complete:
1. **Compilation Check**: Run `npm run build` in `Frontend` to verify zero TypeScript errors and successful production bundling.
2. **Desktop Viewport Verification**: Open `http://localhost:5173/` at 1440x900 in the browser and verify layout harmony, padding, and alignments.
3. **Mobile Viewport Verification**: Switch to 375x812 in the browser and verify that touch targets are comfortable, text doesn't overflow, and the bottom bar clears cleanly.
4. **Interactive State Verification**: Verify hover, focus, active tap, and loading states on all buttons and form fields.
