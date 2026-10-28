# Existing Design System & Layout Inconsistency Audit

**Date:** 2026-10-27  
**Branch:** `design/stage-a`  
**Scope:** Phase 0 Baseline Discovery across `ConsumerLayout`, `SellerLayout`, and `AdminLayout`

---

## 1. Token Architecture & Foundations

### 1.1 Color Tokens & Contrast Findings
- **Current `tailwind.config.js`:**
  ```javascript
  colors: {
    dark: "#0D0D0D",
    gold: "#D4AF37",
    borderdark: "#2E2E2E",
  }
  ```
- **Inconsistencies & Issues:**
  1. **Background Drift:** `ConsumerLayout` uses `bg-[#0D0D0D]`, whereas `SellerLayout` and `AdminLayout` use `bg-black` for the root container and `bg-[#0D0D0D]` for sidebars. Modals and drawers use `#161616` and `#141722`.
  2. **Role Accent Inconsistency:**
     - Consumer: `orange-500` (#f97316) primary with gold accents (#D4AF37).
     - Seller: Navigation highlights use `emerald-500/15` and `text-emerald-400`, but its primary action button ("Create Product") uses `bg-orange-500 hover:bg-orange-600`.
     - Admin: Navigation highlights use `orange-500/15` and `text-orange-400`.
  3. **Low Contrast Microcopy:** Secondary labels frequently use `text-gray-400` (#9ca3af) or `text-gray-500` (#6b7280) on `#0D0D0D` / `#161616`. Contrast ratio for `gray-500` on `#0D0D0D` is ~3.2:1 (fails WCAG AA 4.5:1 for normal body text).
  4. **Ad-hoc Border Opacities:** Inconsistent borders across pages: `border-gray-800`, `border-gray-800/80`, `border-white/10`, `border-[#2E2E2E]`.

### 1.2 Typography & Font Stacks
- **Configured Font:** `font-poppins: ["Poppins", "sans-serif"]`.
- **Gaps:**
  1. Loaded via Google Fonts without `preconnect` to `https://fonts.gstatic.com`.
  2. **No Devanagari fallback:** Devanagari strings fall back to browser default unstyled system fonts (`Mangal` on Windows, causing inconsistent line heights, clipping diacritics, and vertical alignment issues).
  3. No fluid typography scale using `clamp()` for responsive headings.
  4. Text sizing under 16px on mobile inputs (`text-xs` / `text-sm`), triggering iOS Safari automatic zoom.

### 1.3 Breakpoints & Grid System
- Default Tailwind breakpoints (`sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`, `2xl: 1536`).
- **Gaps:**
  - Lacks dedicated small phone (`360px`) and phablet (`480px`) breakpoints.
  - Multi-column grids without `minmax()` fail or collapse abruptly at 320px–360px viewports.

---

## 2. Cross-Layout Structural Comparison

| Dimension | ConsumerLayout | SellerLayout | AdminLayout |
| :--- | :--- | :--- | :--- |
| **Root Background** | `#0D0D0D` | `bg-black` with `#0D0D0D` bar | `bg-black` with `#0D0D0D` bar |
| **Navigation Structure** | Mega-header (`NavBar.tsx` ~58KB) | Collapsible drawer + desktop sticky sidebar | Collapsible drawer + desktop sticky sidebar |
| **Active Nav Highlight** | Underline / text-orange-400 | `bg-emerald-500/15 text-emerald-400` | `bg-orange-500/15 text-orange-400` |
| **Skip-to-Content Link** | Present (`#main-content`) | **Missing** | **Missing** |
| **Safe-Area Insets** | Not applied (`env(safe-area-inset-*)` missing) | Not applied | Not applied |
| **Mobile Drawer Accessibility** | Custom dialog in Navbar, partial ARIA | `div`-based slide-over, no focus trap/ESC | `div`-based slide-over, no focus trap/ESC |
| **Modal / Dialogs** | Ad-hoc modal state per page | Custom logout modal | Custom logout modal |
| **Bottom Navigation** | In Navbar, only links | None | None |

---

## 3. Primitives & Reusability Deficiencies

1. **Button:** Re-declared in every component with inconsistent paddings, font sizes, border radii (`rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`), and transition speeds.
2. **Input / Form Controls:** `InputField.tsx` exists in `components/common/`, but forms in Cart, Checkout, Profile, and Seller pages write raw `<input>` elements with hardcoded styles.
3. **Card Containers:** Cards across catalog, seller dashboard, and admin queue have different padding scales (`p-3`, `p-4`, `p-6`), borders, and hover elevations.
4. **Price Display:** Nepali Rupee formatting is inconsistently implemented across pages (some use `Rs. ${num}`, others `NPR`, others lack thousand-separator grouping conforming to South Asian numbering e.g. `Rs. 1,25,000`).
5. **State Handling:** Skeletons are missing on several pages (using a central spinning wheel `RouteLoader` instead of localized content skeletons). Empty and error states lack standard recovery action buttons.

---

## 4. Next Actions for Phase 0 & Stage A Step 1
1. Build Playwright screenshot and audit harness.
2. Formulate the two visual directions for the Visual Direction Gate.
3. Align with User on Scope Decisions (Dark mode, Nepali UI language, PWA/offline).
