# Phase 8: Smoke, Sanity, Regression, and CI/CD Quality Gates Report
**Project:** AkMart Multi-Vendor E-Commerce Platform  
**Auditor:** Principal QA Architect / Senior SDET  
**Date:** 2026-10-26  
**Active Branch:** `qa-testing`  

---

## 8A. Automated Smoke Test Suite (< 30 Seconds Execution)

Implemented in [`/tests/api/smoke.test.ts`](file:///c:/akmart-ecommerce/tests/api/smoke.test.ts):

| Smoke Check ID | Target Component / Action | Verification Criteria | Execution Time |
| :--- | :--- | :--- | :---: |
| **SMK-01** | `GET /health` | HTTP 200, `status: "ok"`, PostgreSQL & Redis ping | < 50 ms |
| **SMK-02** | `GET /api/v1/categories/tree` | HTTP 200, Array of root categories returned | < 80 ms |
| **SMK-03** | `GET /api/v1/products` | HTTP 200, Public catalog browse returns successfully | < 120 ms |
| **SMK-04** | `GET /api/v1/coupons` | HTTP 200, Active promo codes list returned | < 60 ms |
| **SMK-05** | `GET /api/v1/cart` (Unauth) | HTTP 401 Unauthorized, Cart guarded | < 30 ms |
| **SMK-06** | `POST /api/v1/orders/checkout` (Unauth)| HTTP 401 Unauthorized, Checkout guarded | < 30 ms |
| **SMK-07** | `GET /api/v1/admin/dashboard` (Unauth) | HTTP 401 Unauthorized, Admin wall guarded | < 30 ms |
| **SMK-08** | `GET /api/v1/seller/listings` (Unauth) | HTTP 401 Unauthorized, Seller wall guarded | < 30 ms |
| **SMK-09** | `GET /api/v1/invalid-route` | HTTP 404, Structured JSON error envelope | < 25 ms |
| **SMK-10** | Helmet Ingress Headers | HTTP response contains `X-Content-Type-Options: nosniff` | < 20 ms |

---

## 8B. Sanity Checklist (Post-Hotfix Verification)

1. [ ] **TypeScript Build:** `npx tsc --noEmit` in `/Backend` and `/Frontend` compiles with zero errors.
2. [ ] **Linter:** `npm run lint` passes with 0 errors and 0 security warnings.
3. [ ] **Health Endpoint:** `GET /health` returns HTTP 200 with operational DB and Redis flags.
4. [ ] **Smoke Suite Execution:** `vitest run tests/api/smoke.test.ts` passes 10/10 checks.
5. [ ] **Database Connection:** Prisma client successfully executes queries against test DB.

---

## 8C. Regression Suite Impact Mapping

| Module Modified | Tag Level | Regression Test Sets to Execute | Traced Journeys |
| :--- | :---: | :--- | :--- |
| **Auth / Session** (`auth.service.ts`, `jwt.ts`) | `Regression-Core` | `tests/unit/auth.validator.test.ts`, `tests/api/hostile-input.test.ts`, `tests/api/rbac-matrix.test.ts` | E2E-J07 |
| **Cart & Pricing** (`cart.service.ts`, `ShopContext.tsx`) | `Regression-Core` | `tests/unit/order.calculation.test.ts`, `phase-04-functional-rbac.md` (Cart checks) | E2E-J01, E2E-J03 |
| **Orders & Checkout** (`order.service.ts`) | `Regression-Full` | `tests/performance/checkout-load.yml`, `tests/unit/order.calculation.test.ts` | E2E-J01, E2E-J02, E2E-J04 |
| **Coupons Engine** (`coupon.service.ts`) | `Regression-Core` | `tests/unit/coupon.service.test.ts`, `tests/api/contract.test.ts` | E2E-J01 |
| **Seller Onboarding** (`seller.service.ts`) | `Regression-Full` | `tests/api/rbac-matrix.test.ts`, `tests/e2e/seller-journey.spec.ts` | E2E-J05 (BUG-005) |
| **Admin Controls** (`admin.service.ts`) | `Regression-Full` | `tests/api/rbac-matrix.test.ts`, Product Approval tests | E2E-J06 |

---

## 8D. CI/CD Quality Gates Analysis (`.github/workflows/ci.yml`)

The existing CI configuration in `.github/workflows/ci.yml` is structured across:
1. **Backend Lint & Type Check:** Runs `npm ci`, `prisma generate`, `npm run lint`, `npx tsc --noEmit` [CODE: `ci.yml:44-55`].
2. **Backend Test with PostgreSQL & Redis Services:** Spawns Docker containers for PostgreSQL 16 (`akmart_test`) and Redis 7, runs `npm run test:coverage` [CODE: `ci.yml:63-100`].
3. **Frontend Lint & Build:** Runs `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build` [CODE: `ci.yml:130-170`].

### Recommended Quality Gate Enhancements:
- **Coverage Gate Elevation:** Raise `thresholds` in `Backend/vitest.config.mts` from 35% statements / 20% branches to at least **70% initial / 80% target** on critical modules (GAP-004).
- **Automated Smoke Gate:** Insert `vitest run tests/api/smoke.test.ts` immediately preceding deployment jobs.
- **Frontend Test Suite:** Add frontend component/unit test stage once `vitest` is installed in `Frontend/package.json`.

---

## 8E. Flaky Test Quarantine & Remediation Protocol

1. **Detection:** Any test failing intermittently in CI/CD without code changes is flagged with tag `@flaky`.
2. **Quarantine:** The test is quarantined into a dedicated quarantine suite or marked `.skip` with an assigned `BUG-ID` to prevent blocking deployments.
3. **Root Cause Analysis:** Inspect for asynchronous race conditions, shared test database state, or un-flushed Redis keys.
4. **Enforcement:** All tests must maintain strictly isolated database state via `setup.ts` (`beforeEach` table cleanup).

---

## Phase 8 Verification Checklist

| Checklist Item | Verified | Evidence / Rationale |
| :--- | :---: | :--- |
| **Smoke checks executable under 30 seconds?**| **YES** | 10 lightweight, non-destructive checks automated in `tests/api/smoke.test.ts`. |
| **Impact mapping references existing TCs?** | **YES** | Mapped to TC-U01 through TC-U23, TC-BB-H01 through H20, and E2E journeys. |
| **CI pipeline matches real repository scripts?** | **YES** | Matches scripts in `Backend/package.json` (`test:coverage`, `lint`, `build`) and `.github/workflows/ci.yml`. |
| **Flaky test policy measurable?** | **YES** | Quarantine, root-cause, and isolation protocols defined. |
