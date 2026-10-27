# AKMart Design & UX Audit Progress Ledger

This ledger tracks the audit, verification, and regression status of every page and component across all viewports and states for AKMart.
Every unit corresponds to `(Stage, Page/Component, Viewport Group, State)`.

### Viewport Groups Reference
- **small-phone**: 320x568, 360x640, 375x667
- **phone**: 390x844, 412x915, 430x932
- **tablet**: 600x960, 768x1024 (portrait), 1024x768 (landscape)
- **desktop**: 1280x720, 1366x768, 1440x900, 1920x1080, 2560x1440
- **landscape-phone**: 667x375, 844x390

### Status Legend
- `TODO`: Pending audit and verification
- `IN-PROGRESS`: Currently under audit or active defect remediation
- `PASS`: Passes all criteria in the Definition of Done with verifiable screenshot and test output
- `BLOCKED`: Encountered blocker after max 5 rounds or needs upstream/backend resolution

---

## Executive Progress Summary
| Metric | Count |
| :--- | :--- |
| **Total Units** | 720 |
| **TODO** | 720 |
| **IN-PROGRESS** | 0 |
| **PASS** | 0 |
| **BLOCKED** | 0 |
| **Current Stage** | Stage A: Consumer |
| **Active Chunk** | Chunk A0: Shared Foundations & Design System Primitives |

---

## Stage A: Consumer Units

| Unit ID | Stage | Page / Component | Viewport Group | State | Status | Round | Defects Found | Defects Fixed | Screenshot Link | Test Result Link | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| A-HOME-SP-01 | Stage A | Home | small-phone | loaded | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-SP-02 | Stage A | Home | small-phone | loading | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-SP-03 | Stage A | Home | small-phone | empty | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-SP-04 | Stage A | Home | small-phone | error | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-SP-05 | Stage A | Home | small-phone | long-text | TODO | 0 | - | - | - | - | Devanagari & long titles |
| A-HOME-SP-06 | Stage A | Home | small-phone | many-items | TODO | 0 | - | - | - | - | Grid stress test |
| A-HOME-PH-01 | Stage A | Home | phone | loaded | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-PH-02 | Stage A | Home | phone | loading | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-PH-03 | Stage A | Home | phone | empty | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-PH-04 | Stage A | Home | phone | error | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-PH-05 | Stage A | Home | phone | long-text | TODO | 0 | - | - | - | - | Devanagari & long titles |
| A-HOME-PH-06 | Stage A | Home | phone | many-items | TODO | 0 | - | - | - | - | Grid stress test |
| A-HOME-TB-01 | Stage A | Home | tablet | loaded | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-TB-02 | Stage A | Home | tablet | loading | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-TB-03 | Stage A | Home | tablet | empty | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-TB-04 | Stage A | Home | tablet | error | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-TB-05 | Stage A | Home | tablet | long-text | TODO | 0 | - | - | - | - | Devanagari & long titles |
| A-HOME-TB-06 | Stage A | Home | tablet | many-items | TODO | 0 | - | - | - | - | Grid stress test |
| A-HOME-DK-01 | Stage A | Home | desktop | loaded | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-DK-02 | Stage A | Home | desktop | loading | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-DK-03 | Stage A | Home | desktop | empty | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-DK-04 | Stage A | Home | desktop | error | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-DK-05 | Stage A | Home | desktop | long-text | TODO | 0 | - | - | - | - | Devanagari & long titles |
| A-HOME-DK-06 | Stage A | Home | desktop | many-items | TODO | 0 | - | - | - | - | Grid stress test |
| A-HOME-LP-01 | Stage A | Home | landscape-phone | loaded | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-LP-02 | Stage A | Home | landscape-phone | loading | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-LP-03 | Stage A | Home | landscape-phone | empty | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-LP-04 | Stage A | Home | landscape-phone | error | TODO | 0 | - | - | - | - | Initial baseline |
| A-HOME-LP-05 | Stage A | Home | landscape-phone | long-text | TODO | 0 | - | - | - | - | Devanagari & long titles |
| A-HOME-LP-06 | Stage A | Home | landscape-phone | many-items | TODO | 0 | - | - | - | - | Grid stress test |
| A-NAV-ALL | Stage A | Navbar & Header | all-viewports | all-states | TODO | 0 | - | - | - | - | Search, menu, safe area |
| A-BNAV-ALL | Stage A | Mobile Bottom Nav | mobile-viewports | all-states | TODO | 0 | - | - | - | - | 44px tap targets, active state |
| A-COL-ALL | Stage A | Collection / Catalog | all-viewports | all-states | TODO | 0 | - | - | - | - | Filters bottom-sheet, sort |
| A-PROD-ALL | Stage A | Product Detail | all-viewports | all-states | TODO | 0 | - | - | - | - | Variants, sticky CTA, gallery |
| A-CART-ALL | Stage A | Cart & Cart Drawer | all-viewports | all-states | TODO | 0 | - | - | - | - | Vendor groups, empty/loaded |
| A-CHK-ALL | Stage A | Checkout | all-viewports | all-states | TODO | 0 | - | - | - | - | Single-col mobile, COD badge |
| A-ORD-ALL | Stage A | Orders & Order Detail | all-viewports | all-states | TODO | 0 | - | - | - | - | Stepper, invoice print |
| A-WSH-ALL | Stage A | Wishlist | all-viewports | all-states | TODO | 0 | - | - | - | - | Grid, move to cart |
| A-PRF-ALL | Stage A | Profile | all-viewports | all-states | TODO | 0 | - | - | - | - | Address cascade, orders |
| A-AUTH-ALL | Stage A | Auth (Login/Register/OTP) | all-viewports | all-states | TODO | 0 | - | - | - | - | 16px font on inputs, focus |
| A-INFO-ALL | Stage A | Info Pages (About/Contact/Legal) | all-viewports | all-states | TODO | 0 | - | - | - | - | Responsive prose & cards |
| A-ERR-ALL | Stage A | 404 & Error Page | all-viewports | all-states | TODO | 0 | - | - | - | - | Helpful navigation & recovery |

---

## Stage B: Seller Units
| Unit ID | Stage | Page / Component | Viewport Group | State | Status | Round | Defects Found | Defects Fixed | Screenshot Link | Test Result Link | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| B-DASH-ALL | Stage B | Dashboard | all-viewports | all-states | TODO | 0 | - | - | - | - | Stat cards reflow |
| B-ORD-ALL | Stage B | Orders & Fulfillment | all-viewports | all-states | TODO | 0 | - | - | - | - | Card view on mobile |
| B-PROD-ALL | Stage B | Products List | all-viewports | all-states | TODO | 0 | - | - | - | - | Stock controls at 360px |
| B-CRPR-ALL | Stage B | Create Product Form | all-viewports | all-states | TODO | 0 | - | - | - | - | Accordions/steps, image upload |
| B-LIST-ALL | Stage B | Listings Management | all-viewports | all-states | TODO | 0 | - | - | - | - | Multi-vendor offers |
| B-SET-ALL | Stage B | Shop Settings | all-viewports | all-states | TODO | 0 | - | - | - | - | Form fields & validation |
| B-ONB-ALL | Stage B | Onboarding & Status | all-viewports | all-states | TODO | 0 | - | - | - | - | Pending/rejected banners |

---

## Stage C: Admin Units
| Unit ID | Stage | Page / Component | Viewport Group | State | Status | Round | Defects Found | Defects Fixed | Screenshot Link | Test Result Link | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C-DASH-ALL | Stage C | Dashboard | all-viewports | all-states | TODO | 0 | - | - | - | - | Metric tiles reflow |
| C-ORD-ALL | Stage C | Orders & Drawer | all-viewports | all-states | TODO | 0 | - | - | - | - | Full screen drawer on mobile |
| C-PROD-ALL | Stage C | Products Queue | all-viewports | all-states | TODO | 0 | - | - | - | - | Approval flow |
| C-REV-ALL | Stage C | Product Review Detail | all-viewports | all-states | TODO | 0 | - | - | - | - | Diff and moderation |
| C-SELL-ALL | Stage C | Sellers Management | all-viewports | all-states | TODO | 0 | - | - | - | - | Verify/reject dialogs |
| C-CAT-ALL | Stage C | Categories & Studio | all-viewports | all-states | TODO | 0 | - | - | - | - | Tree and attribute builder |
| C-BRN-ALL | Stage C | Brands Registry | all-viewports | all-states | TODO | 0 | - | - | - | - | Logo uploads and list |
