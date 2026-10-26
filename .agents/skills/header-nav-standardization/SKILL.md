---
name: header-nav-standardization
description: Comprehensive element-by-element industry standard specifications, visual design tokens, icon/button auditing rules, interactive polish checklist, and multi-breakpoint responsive testing matrix for the AkMart header, search bar, navigation bar, and user controls.
---

# AkMart Header & Navigation Standardization & Testing Blueprint

This skill serves as the canonical test track, responsive audit guide, and element-by-element implementation reference for the AkMart header and navigation ecosystem across all device viewports:
- **Mobile** (`< 640px`)
- **Tablet** (`640px – 1024px`)
- **Desktop** (`1024px – 1440px`)
- **Ultrawide** (`> 1440px`)

---

## 1. Complete Element Inventory (From Header Screenshot)

Every item visible in the top header and sub-navigation bar is tracked below with its exact name, component hook, and test requirements:

### Top Primary Header Elements:
1. **Brand Logo Icon & Graphic**: Cart mark with "AK" inside (`assets.logo`).
2. **"Nepal Hub" Marketplace Badge**: Micro-badge next to brand logo designating national marketplace.
3. **Search Magnifier Icon**: Decorative search glyph (`FiSearch`) positioned inside the search input.
4. **Search Input Field**: Text input with placeholder `"Search for products, brands, categories..."`.
5. **Search Clear Button ('X' icon)**: Dismiss button (`FiX`) appearing conditionally when input has query.
6. **"Search" Action CTA Button**: Prominent orange button on the right end of the input container.
7. **Search Live Autocomplete Dropdown**: Floating popover showing matching categories, product thumbnails, prices, and "View all results" link.
8. **"Become a Seller" Action Button**: Secondary CTA button linking to Merchant Center (`/seller/dashboard` or `/register`).
9. **Wishlist Icon Button**: Heart icon (`FiHeart`) button navigating to `/wishlist`.
10. **Cart Icon Button**: Shopping cart icon (`FiShoppingCart`) button navigating to `/cart`.
11. **Cart Count Badge**: Floating quantitative indicator displaying total active cart items.
12. **User Profile Avatar**: Gradient circle displaying user's initial (`M`).
13. **User Profile Display Name**: Primary user identifier (formatted cleanly without email cuts or harsh `...`).
14. **User Profile Role Subtitle**: Account type indicator (`Account` / `Consumer` / `Seller` / `Admin`).
15. **User Profile Chevron Icon**: Directional arrow (`FiChevronDown`) indicating dropdown state.
16. **User Profile Dropdown Menu**: Floating card containing "My Profile", "My Orders & Tracking", "Seller/Admin Dashboard", and "Sign Out".

### Bottom Category Sub-Navigation Strip Elements:
17. **"All Products" Icon**: 4-square grid icon (`FiGrid`).
18. **"All Products" Navigation Link**: Button navigating to `/collection` without category filter.
19. **"Electronics" Department Icon**: Vector chip icon (`FiCpu`).
20. **"Electronics" Department Link**: Category button navigating to `/collection?category=electronics`.
21. **"Electronics" Dropdown Chevron**: Directional indicator for category mega-menu.
22. **"Home & Living" Department Icon**: Sofa/interior vector icon (`HomeLivingIcon`).
23. **"Home & Living" Department Link**: Category button navigating to `/collection?category=home-living`.
24. **"Home & Living" Dropdown Chevron**: Directional indicator for category mega-menu.
25. **"Kids" Department Icon**: Smiling face vector icon (`FiSmile`).
26. **"Kids" Department Link**: Category button navigating to `/collection?category=kids`.
27. **"Kids" Dropdown Chevron**: Directional indicator for category mega-menu.
28. **"Men" Department Icon**: Person vector icon (`FiUser`).
29. **"Men" Department Link**: Category button navigating to `/collection?category=men`.
30. **"Men" Dropdown Chevron**: Directional indicator for category mega-menu.
31. **"Women" Department Icon**: Shopping bag vector icon (`FiShoppingBag`).
32. **"Women" Department Link**: Category button navigating to `/collection?category=women`.
33. **"Women" Dropdown Chevron**: Directional indicator for category mega-menu.
34. **Sub-Nav Vertical Separator Line**: Dividing border between categories and promotional pills.
35. **"Lowest Price Guarantee" Lightning Icon**: Benefit badge icon (`FiZap`).
36. **"Lowest Price Guarantee" Action Pill**: Promotional button sorting collection by lowest price (`/collection?sort=price-low`).

### Responsive Mobile & Tablet Specific Elements:
37. **Mobile Hamburger Menu Icon**: Drawer toggle icon (`FiMenu` / `FiX`).
38. **Mobile Search Expand Trigger**: Header search icon button opening search drawer on small screens.
39. **Mobile Slide-Out Navigation Drawer**: Off-canvas drawer menu containing category hierarchy and account links.
40. **Mobile Fixed Bottom Navigation Bar**: 5-tab app-style bottom bar (`Home`, `Explore`, `Wishlist`, `Cart`, `Account`).

---

## 2. Multi-Breakpoint Responsive Design Matrix

| Breakpoint | Target Screen Width | Header Behavior | Sub-Nav Strip Behavior | Bottom Bar |
|---|---|---|---|---|
| **Mobile (`xs`/`sm`)** | `< 640px` | Logo + Mobile Search Trigger + Cart + Hamburger. Full search bar hidden behind toggle. | Hidden completely to prevent vertical crowding. | Active: Fixed 5-tab bar with safe-area padding (`pb-[max(0.6rem,env(safe-area-inset-bottom))]`). |
| **Tablet (`md`)** | `640px – 1024px` | Logo + Central Search Bar + Wishlist + Cart + Profile. | Visible: Horizontal scrollable strip (`no-scrollbar`) without line breaks. | Hidden. Top navigation handles all routing. |
| **Desktop (`lg`/`xl`)** | `1024px – 1440px` | Full navigation: Logo + "Nepal Hub" + Search + "Become a Seller" + Wishlist + Cart + Profile. | Full strip with Mega-Menu dropdowns on hover. | Hidden. |
| **Ultrawide (`2xl`)** | `> 1440px` | Constrained within `max-w-7xl mx-auto px-8` preventing awkward stretching. | Centered grid with generous spacing (`gap-4 lg:gap-6`). | Hidden. |

---

## 3. Element-by-Element Functional Testing & Quality Standards

When testing each element one by one, verify against these 5 critical dimensions:

### 1. Functional Routing & Action
- Does clicking the element navigate to the exact correct URL?
- Does it pass query parameters (e.g. `?search=shoes`, `?category=electronics`, `?sort=price-low`)?
- Does it close any open dropdowns or mobile drawers upon selection?

### 2. State & Data Reactivity
- **Cart**: Does the badge increment immediately when an item is added from product detail or collection?
- **Wishlist**: Does it reflect saved items or guide the user smoothly?
- **Search**: Does typing trigger debounced API calls (`browseProducts`) without crashing or spamming? Does Enter submit the form? Does clicking Clear empty the input and reset focus?
- **Profile**: Does it show actual user info if logged in (`fullName`, initials, role)? If logged out, does it show `Sign In`? Does `Sign Out` purge JWT tokens and reset state cleanly?

### 3. UI/UX Visual Polish
- Minimum touch target `40x40px` (`p-2.5` or `w-10 h-10`).
- No rogue white borders or browser focus rings.
- Smooth transitions (`duration-150` or `duration-200`).
- Consistent dark theme palette (`#0D0D0D` header, `#161616` inputs/pills, `#F97316` brand orange).

### 4. Zero-Truncation Typography
- Names must never render as `mandalavijee...` with raw string cutoffs.
- Use intelligent parsing (`getDisplayName`) with ample flex width (`max-w-[125px]`).
- Secondary labels must use subtle uppercase tracking (`text-[9.5px] uppercase tracking-wider`).

### 5. Multi-Breakpoint Responsiveness
- Test layout at `375px` (iPhone), `768px` (iPad), `1024px` (Laptop), and `1440px` (Desktop).
- Zero horizontal overflow (`overflow-x: hidden` on viewport).
- Drawer touch targets at least 44px tall.

---

## 4. One-by-One Element Audit & Status Tracker

| ID | Element Name | Visual Polish | Functionality | Mobile/Tablet | Status |
|---|---|---|---|---|---|
| **01** | Brand Logo | Authentic AkMart mark (Blue cart + checkmark) | Links to `/` | Responsive scaling (`h-8 sm:h-9`) | 🟢 Completed (Authentic Brand Mark) |
| **02** | "Nepal Hub" Badge | Baseline aligned, verified pulse dot | Regional status | Clean pill, hidden `<640px` | 🟢 Completed (Pulse Badge) |
| **03** | Search Magnifier Icon | Clean SVG, active focus glow | Reactive icon focus | Mobile drawer icon | 🟢 Completed |
| **04** | Search Input Field | `#161616`, focus ring, Escape dismiss | Multi-field fuzzy search | Mobile drawer synced | 🟢 Completed |
| **05** | Search Clear Button | Rounded-full hover pill, `FiX` | Clears query & closes popover | Mobile drawer touch pill | 🟢 Completed |
| **06** | "Search" Submit Button | Orange CTA pill, tactile micro-scale | Submits `?search=...` | Styled submit button | 🟢 Completed |
| **07** | Search Autocomplete | Thumbnails, prices, categories | Multi-token relevance search | Mobile drawer live list | 🟢 Completed |
| **08** | "Become a Seller" CTA | Secondary pill with `FiBriefcase` | Routes to seller portal | In mobile drawer menu | 🟢 Completed |
| **09** | Wishlist Button | `w-10 h-10 rounded-xl` container | Routes to `/wishlist` | In mobile bottom nav | 🟢 Completed |
| **10** | Cart Button | `w-10 h-10 rounded-xl` container | Routes to `/cart` | In mobile bottom nav & header | 🟢 Completed |
| **11** | Cart Count Badge | `-top-1 -right-1`, ring border | Reactive count update | Matches desktop & bottom bar | 🟢 Completed |
| **12** | User Profile Avatar | Gradient circle with initial | Toggle dropdown | In mobile bottom nav / drawer | 🟢 Completed |
| **13** | User Display Name | Clean name without raw cutoffs | Visual label | Full name in drawer header | 🟢 Completed |
| **14** | User Role Subtitle | Elegant micro-pill | Role badge | Role badge in drawer header | 🟢 Completed |
| **15** | Profile Chevron Icon | Smooth 180° rotation | Visual toggle state | N/A | 🟢 Completed |
| **16** | Profile Dropdown Menu | Floating card, rich links | Profile/Orders/Logout | Drawer handles mobile | 🟢 Completed |
| **17** | "All Products" Button | `FiGrid` icon + active pill | Routes to `/collection` | In mobile drawer | 🟡 Ready for Test |
| **18** | Department: Electronics | `FiCpu` icon + hover mega-menu | Filter `?category=electronics` | In mobile drawer list | 🟡 Ready for Test |
| **19** | Department: Home & Living | Sofa vector icon + mega-menu | Filter `?category=home-living` | In mobile drawer list | 🟡 Ready for Test |
| **20** | Department: Kids | `FiSmile` icon + mega-menu | Filter `?category=kids` | In mobile drawer list | 🟡 Ready for Test |
| **21** | Department: Men | `FiUser` icon + mega-menu | Filter `?category=men` | In mobile drawer list | 🟡 Ready for Test |
| **22** | Department: Women | `FiShoppingBag` icon + mega-menu| Filter `?category=women` | In mobile drawer list | 🟡 Ready for Test |
| **23** | Lowest Price Guarantee | `FiZap` icon + pill button | Sorts `?sort=price-low` | Accessible in mobile collection | 🟡 Ready for Test |
| **24** | Mobile Drawer & Bottom Nav| Fixed `z-40`, safe bottom space| Tab switching + drawer toggle| Native mobile experience | 🟡 Ready for Test |
