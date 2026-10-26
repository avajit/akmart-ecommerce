# Master QA Ledger & Inventory
**Project:** AkMart Multi-Vendor E-Commerce Platform  
**Current Branch:** `qa-testing`  
**Active Phase:** All Phases Complete (Phase 0 to Phase 13 Full-Stack Audit Finalized)  
**Last Updated:** 2026-10-26  

---

## 1. Context & State Recap
- **Architecture:** Monorepo with React 19 Frontend (Vite 7, TailwindCSS 3.4, Zustand 5, React Query 5) and Express 5 TypeScript Modular Monolith Backend (PostgreSQL via Prisma ORM, Redis via ioredis).
- **Environment Status:** 
  - Backend running on `http://localhost:5000` (PID active, `/health` returned HTTP 200 `{"status":"ok","message":"All systems operational"}`)
  - Frontend running on `http://localhost:5173` (PID active, HTML rendered with title `AKMart | Online Shopping Nepal`)
  - Test Database: `akmart_test_db` (Isolated, referenced in `Backend/.env.test`)
- **Audit Findings:** 111 Test Cases designed across `/tests`; 11 confirmed bugs (`BUG-001` to `BUG-011`); 17 architectural gaps (`GAP-001` to `GAP-017`); 18 actionable tasks (`TASK-001` to `TASK-018`); 6 UI/UX defects (`UI-001` to `UI-006`).
- **Release Verdict:** **NOT READY FOR PRODUCTION** (Blocked by P0 Seller Lockout BUG-005, P1 Token Reuse BUG-002, P1 Address Deletion Crash BUG-003, P1 Unvalidated Product Crash BUG-008, P1 Placeholder Reviews BUG-010).

---

## 2. Master Tracking Tables

### A. Test Cases (TCs)
| TC ID | Phase | Type | Module | Technique | Title | Status | Evidence Tag |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **TC-U01** to **TC-U08** | 2 | Unit | CouponService | EP & BVA | Coupon discount validation and caps | Written | [CODE: `coupon.service.test.ts`] |
| **TC-U09** to **TC-U18** | 2 | Unit | AuthValidator | BVA & EP | Registration, phone, and password boundaries | Written | [CODE: `auth.validator.test.ts`] |
| **TC-U19** to **TC-U23** | 2 | Unit | OrderCalculation| BVA & EP | Shipping fee threshold and total calculations | Written | [CODE: `order.calculation.test.ts`] |
| **TC-BB-H01**-**H20** | 3 | API | Auth / Ingress | Hostile Inputs | Fuzzing login with SQLi, XSS, Path Traversal | Written | [CODE: `hostile-input.test.ts`] |
| **TC-BB-C01**-**C02** | 3 | API | CouponService | Hostile Inputs | SQLi in coupons and negative order amounts | Written | [CODE: `hostile-input.test.ts`] |
| **TC-ST01** to **TC-ST04** | 3 | Functional | OrderService | State Transition | Order lifecycle legal & illegal transitions | Written | [CODE: `phase-03-black-box.md`] |
| **TC-F01** to **TC-F05** | 4 | Functional | Catalog | Equivalence & Boundary | Product browsing, search, and pagination | Written | [CODE: `phase-04-functional-rbac.md`] |
| **TC-F06** to **TC-F10** | 4 | Functional | Cart | Business Rule | Cart stock checks, price snapshots, unauth | Written | [CODE: `phase-04-functional-rbac.md`] |
| **TC-F11** to **TC-F15** | 4 | Functional | Checkout | Business Rule | Transactional stock deduction, delivery fees | Written | [CODE: `phase-04-functional-rbac.md`] |
| **TC-F16** to **TC-F20** | 4 | Functional | Order | IDOR & State | Order cancellation, inventory restoration | Written | [CODE: `phase-04-functional-rbac.md`] |
| **TC-F21** to **TC-F25** | 4 | Functional | Seller | RBAC & Validation| Seller listing creation, approval check | Written | [CODE: `phase-04-functional-rbac.md`] |
| **TC-RBAC-01**-**07** | 4 | Security | RBAC | Permission Matrix | Vertical privilege checks for Admin & Seller | Written | [CODE: `rbac-matrix.test.ts`] |
| **TC-INT-01** to **05**| 5 | Contract | API / Ingress | Schema Conformance | Contract, headers, and error envelopes | Written | [CODE: `contract.test.ts`] |
| **TC-E2E-01** | 6 | E2E | Consumer | Journey Flow | Catalog to checkout end-to-end journey | Written | [CODE: `consumer-journey.spec.ts`] |
| **TC-E2E-02** | 6 | E2E | Seller | Merchant Wall | Seller onboarding gatekeeping & auth redirect| Written | [CODE: `seller-journey.spec.ts`] |
| **SMK-01** to **SMK-10**| 8 | Smoke | Core Platform | Smoke Gate | Health, Catalog, Cart, Admin wall, Headers | Written | [CODE: `smoke.test.ts`] |
| **TC-UI-01** to **03** | 11 | UI / Visual | Storefront | Responsive Matrix | Desktop, Tablet, and Mobile Layout Checks | Written | [CODE: `visual-regression.spec.ts`] |

### B. Bug Reports (BUGs)
| Bug ID | Title | Location | Severity | Priority | Status | Quoted Evidence Tag |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **BUG-001** | Hardcoded Localhost URL in Cancel Link | `auth.service.ts:79` | Medium | P1 | **Resolved** | [CODE: `auth.service.ts:79`, `env.ts:37`] |
| **BUG-002** | Missing Token Family Revocation on Reused Refresh Token | `auth.service.ts:150-152` | High | P1 | **Resolved** | [CODE: `auth.service.ts:150-165`] |
| **BUG-003** | Foreign Key Violation on Deleting In-Use Address | `order.service.ts:328` | High | P1 | **Resolved** | [CODE: `order.service.ts:331-345`] |
| **BUG-004** | Missing Verified Purchase Gate in Product Reviews | `product.service.ts:478-501`| Medium | P2 | **Resolved** | [CODE: `product.service.ts:489-506`] |
| **BUG-005** | Seller Onboarding Role Mutation Locks Consumer Shopping Flow | `seller.service.ts:13-16` | High | P0 | **Resolved** | [CODE: `cart.routes.ts:7`, `order.routes.ts:7`, `AppRoutes.tsx:82`] |
| **BUG-006** | Sensitive DB Schema Leaked in Error Handler | `errorHandler.ts:36-37` | Medium | P2 | **Resolved** | [CODE: `errorHandler.ts:32-45`] |
| **BUG-007** | Missing Algorithm Restriction in JWT Verification | `jwt.ts:27,31` | Medium | P2 | **Resolved** | [CODE: `jwt.ts:15,19,27,31`] |
| **BUG-008** | Unvalidated Product Creation and Update Payloads | `product.controller.ts:38,54`| High | P1 | **Resolved** | [CODE: `product.validator.ts`, `product.routes.ts:35,37`] |
| **BUG-009** | Unvalidated Category and Brand Admin Update Payloads | `admin.controller.ts:117,163`| Medium | P2 | **Resolved** | [CODE: `admin.validator.ts`, `admin.routes.ts:28,32`] |
| **BUG-010** | Hardcoded Synthetic Reviews & Missing API Call on Submit | `Product.tsx:48-85,802` | High | P1 | **Resolved** | [CODE: `Product.tsx:48-85,785`] |
| **BUG-011** | Subtext `#6B7280` Fails WCAG Contrast on `#141414` | `Orders.tsx:237`, `Cart.tsx:651` | Low | P3 | **Resolved** | [CODE: `Orders.tsx:237`, `Cart.tsx:651`] |

### C. Gaps & Technical Debt (GAP-xxx)
- **GAP-001:** Frontend lacks automated testing framework in `Frontend/package.json`.
- **GAP-002:** Unused backend dependencies declared in `Backend/package.json` (`winston`, `axios`).
- **GAP-003:** Controller-level input validation missing on product and category/brand mutations.
- **GAP-004:** CI / Vitest coverage threshold is set to 35% statements / 20% branches instead of 80%.
- **GAP-005:** Product under review (`PENDING_REVIEW`) can be modified without resetting status.
- **GAP-006:** Inconsistent 404 unhandled route response envelope format.
- **GAP-007:** Address deletion foreign key failure when referenced in past orders.
- **GAP-008:** Missing refresh token family invalidation on replay detection.
- **GAP-009:** Hardcoded localhost URL in email verification cancel link.
- **GAP-010:** Product review submission lacks purchase history verification.
- **GAP-011:** Missing "Skip to content" link for keyboard accessibility in `ConsumerLayout.tsx`.
- **GAP-012:** Date formatting in orders lacks explicit Nepal timezone (`Asia/Kathmandu`).
- **GAP-013:** Storefront lacks Nepali language (Devanagari script) localization.
- **GAP-014:** Unstructured console logging (Winston installed but unconfigured in backend).
- **GAP-015:** Missing request correlation ID (`X-Request-Id`) across backend services.
- **GAP-016:** Missing APM / metrics observability endpoint (`/metrics`).
- **GAP-017:** Root `README.md` out of date ("Backend Coming Soon").

### D. Actionable Tasks (TASK-xxx)
- **TASK-001 (P0):** Fix Seller Role Mutation Lockout on Consumer Flow (BUG-005)
- **TASK-002 (P1):** Add Zod Validation Schema for Product Mutations (BUG-008)
- **TASK-003 (P1):** Enforce Refresh Token Family Invalidation on Replay (BUG-002)
- **TASK-004 (P1):** Soft-Delete or Cascade Check on Address Deletion (BUG-003)
- **TASK-005 (P1):** Parameterize Base URL in Auth Email Links (BUG-001)
- **TASK-006 (P1):** Install Frontend Test Runner in devDependencies (GAP-001)
- **TASK-007 (P1):** Wire Product Reviews to Backend API & Remove Placeholders (BUG-010)
- **TASK-008 (P2):** Mask Prisma Schema Details in Centralized Error Handler (BUG-006)
- **TASK-009 (P2):** Whitelist JWT Algorithms in `jwt.verify` (BUG-007)
- **TASK-010 (P2):** Enforce Verified Purchase Check for Reviews (BUG-004)
- **TASK-011 (P2):** Add Request Schemas for Category & Brand Admin Updates (BUG-009)
- **TASK-012 (P2):** Align 404 Catch-All Response Format (GAP-006)
- **TASK-013 (P2):** Elevate CI Coverage Threshold to 70% (GAP-004)
- **TASK-014 (P2):** Configure Winston Structured JSON Logger (GAP-014)
- **TASK-015 (P2):** Implement Request Correlation ID Middleware (GAP-015)
- **TASK-016 (P2):** Add Accessible Skip Link in ConsumerLayout (GAP-011)
- **TASK-018 (P3):** Update Root `README.md` with Backend Instructions (GAP-017)
- **TASK-019 (P0):** Real Payment Gateway Verification (eSewa HMAC & Khalti lookup) — Currently Simulated
- **TASK-020 (P1):** Restrict Vercel Wildcard CORS and production cookie domain
- **FEATURE-ASP (Active/Approved):** Anti-Self-Purchase Gatekeeper in `cart.service.ts` & `order.service.ts` approved by user to maintain review & ranking integrity.

### E. UI & Accessibility Defects (UI-xxx)
- **UI-001 (High):** Hardcoded synthetic customer reviews in `Product.tsx:48-85`.
- **UI-002 (Low):** Subtext `#6B7280` has 3.8:1 contrast on dark canvas `#141414` (WCAG 2.1 AA violation).
- **UI-003 (Medium):** Missing "Skip to main content" bypass link for keyboard shoppers (WCAG 2.4.1).
- **UI-004 (Low):** Cart promo code input lacks `aria-label` or `<label>` element (WCAG 3.3.2).
- **UI-005 (Low):** Header icon button touch target is 40x40px, below recommended 44x44px.
- **UI-006 (Low):** Coupon remove button lacks explicit `aria-label`.

### F. Service Level Objectives (SLO-xxx)
- **SLO-01:** p95 read latency < 300 ms on public catalog routes.
- **SLO-02:** p95 write latency < 800 ms on stateful mutations.
- **SLO-03:** 99.9% availability on healthcheck probe.
- **SLO-04:** Error rate < 0.1% on non-4xx client errors.
- **SLO-05:** 100% of brute-force attempts throttled at 5 req/min.
- **SLO-06:** Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1).

### G. Open Questions (Q-xxx)
- **Q-001:** What is the status of the test database `akmart_test_db` (is it provisioned in PostgreSQL with schema migrations deployed)?
- **Q-002:** Are sandbox credentials for eSewa / Khalti available, or shall payments default to COD and mock providers?
- **Q-003:** Is AWS S3 mocked with LocalStack/memory, or should image endpoints accept URI strings in test environments?
- **Q-004:** Should devDependencies `@playwright/test` or `vitest` + `@testing-library/react` be added to `Frontend` when Phase 6/11 begins?
- **Q-005:** Are there maximum quantity limits per item in cart (e.g. max 5 or 10 units)?
- **Q-006:** Is there a formal privacy notice presented during registration for storing phone numbers and PAN/banking details?
