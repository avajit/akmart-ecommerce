# Phase 10: Gap Analysis, Prioritized To-Do List, and Do-Not Rules
**Project:** AkMart Multi-Vendor E-Commerce Platform  
**Auditor:** Principal QA Architect / Senior SDET  
**Date:** 2026-10-26  
**Active Branch:** `qa-testing`  

---

## 10A. Missing-Items Audit & Gap Analysis

| GAP ID | Functional / Architectural Area | Missing Item Description | Quoted Evidence Tag | Risk Assessment | Exact Test or Fix Code Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-001** | Frontend Testing Infrastructure | Missing test runner, React testing library, and Playwright in `Frontend/package.json` | [CODE: `Frontend/package.json:1-40`] | Critical: Frontend regressions undetected | Install `@playwright/test` and `vitest` + `@testing-library/react` |
| **GAP-002** | Backend Dependency Pruning | `winston` and `axios` declared in dependencies but never imported in `src/` | [CODE: `Backend/package.json:26,43`] | Low: Image bloat, security attack surface | Remove from `dependencies` in `Backend/package.json` |
| **GAP-003** | Controller Input Validation | Missing Zod request schema validation in `product.controller.ts:38,54` and `admin.controller.ts:117,163` | [CODE: `product.controller.ts:38`, `admin.controller.ts:117`] | High: TypeErrors crash server into unhandled 500s | Implement `validateRequest(createProductSchema)` |
| **GAP-004** | CI Quality Thresholds | Vitest coverage thresholds set to 35% statements / 20% branches | [CODE: `vitest.config.mts:21-26`] | High: Untested regressions slip into production | Raise thresholds in `vitest.config.mts` to 70-80% |
| **GAP-005** | Catalog Workflow Integrity | Seller can edit product while status is `PENDING_REVIEW` without resetting status to `DRAFT` | [CODE: `product.service.ts:58-65`] | Medium: Reviewer approves different content than submitted | Restrict product updates when status is `PENDING_REVIEW` |
| **GAP-006** | Error Format Consistency | 404 catch-all handler returns different JSON error structure than centralized `errorHandler.ts` | [CODE: `app.ts:101-107`] | Low: Inconsistent frontend error toast parsing | Align catch-all 404 response structure with `errorHandler.ts` |
| **GAP-007** | Address Data Integrity | Deleting an address referenced by existing orders causes unhandled Foreign Key crash | [CODE: `order.service.ts:328`] | High: Customer encounters 500 error when managing addresses | Implement soft-delete `isDeleted: true` on `Address` model |
| **GAP-008** | Token Security | Revoked refresh token reuse does not invalidate the user's active session family | [CODE: `auth.service.ts:150-152`] | High: Session hijacking vulnerability | On reuse detection, revoke all sessions for `existingToken.userId` |
| **GAP-009** | URL Hardcoding | Hardcoded `http://localhost:5000` in auth registration cancel link | [CODE: `auth.service.ts:79`] | Medium: Broken email links in staging and production | Read base URL from `env.FRONTEND_WEB_URL` or `env.API_BASE_URL` |
| **GAP-010** | Review Purchase Gate | `isVerifiedPurchase` is never checked or set when reviews are submitted | [CODE: `product.service.ts:478-501`] | Medium: Competitors can review-bomb products | Query `OrderItem` to confirm delivered order before review creation |

---

## 10B. Prioritized Actionable To-Do List

### Group 1: MUST DO BEFORE RELEASE (P0 / P1)
| TASK ID | Actionable Task | Related Finding IDs | Assigned Owner | Priority | Effort | Done When (Acceptance Criteria) | Retest Plan |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **TASK-001**| Fix Seller Role Mutation Lockout on Consumer Flow | BUG-005, GAP-005 | Backend Lead | **P0** | **M** | Applying for seller profile does not revoke consumer checkout ability (`requireRole` allows both or preserves multi-role). | Rerun `TC-RBAC-05`, `TC-RBAC-06`, `TC-E2E-02` |
| **TASK-002**| Add Zod Validation Schema for Product Mutations | BUG-008, GAP-003 | Backend Dev | **P1** | **S** | `createProductSchema` validates `name` (min 2 chars), `categoryId` (UUID), `variants` (valid SKUs, attributes). | Rerun `TC-F21`, `TC-BB-H15` |
| **TASK-003**| Enforce Refresh Token Family Invalidation on Replay | BUG-002, GAP-008 | Security Dev | **P1** | **S** | Presenting an already-revoked refresh token revokes all tokens for that `userId` in `RefreshToken` table. | Rerun `TC-INT-04`, `TC-RBAC-01` |
| **TASK-004**| Soft-Delete or Cascade Check on Address Deletion | BUG-003, GAP-007 | Backend Dev | **P1** | **S** | Deleting address with existing orders soft-deletes or blocks with clean 400 error rather than 500 crash. | Rerun `TC-F16`, `TC-F20` |
| **TASK-005**| Parameterize Base URL in Auth Email Links | BUG-001, GAP-009 | Backend Dev | **P1** | **XS** | Registration cancel link uses configured `env.FRONTEND_WEB_URL` instead of hardcoded `localhost:5000`. | Rerun `TC-U09` |
| **TASK-006**| Install Frontend Test Runner in devDependencies | GAP-001 | Frontend Lead | **P1** | **M** | Vitest and Playwright installed and integrated into `.github/workflows/ci.yml`. | Rerun `ci.yml` frontend stage |

### Group 2: SHOULD DO SOON AFTER RELEASE (P2)
| TASK ID | Actionable Task | Related Finding IDs | Assigned Owner | Priority | Effort | Done When | Retest Plan |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **TASK-007**| Mask Prisma Schema Details in Centralized Error Handler | BUG-006 | Security Dev | **P2** | **XS** | Internal Prisma column/constraint names replaced with generic client-safe messages. | Rerun `TC-INT-04` |
| **TASK-008**| Whitelist JWT Algorithms in `jwt.verify` | BUG-007 | Security Dev | **P2** | **XS** | `jwt.verify` explicitly enforces `{ algorithms: ['HS256'] }`. | Rerun `TC-U09` |
| **TASK-009**| Enforce Verified Purchase Check for Reviews | BUG-004, GAP-010 | Backend Dev | **P2** | **S** | Non-purchasers blocked from reviewing; verified purchasers receive `isVerifiedPurchase: true`. | Rerun `TC-F05` |
| **TASK-010**| Add Request Schemas for Category & Brand Admin Updates | BUG-009, GAP-003 | Backend Dev | **P2** | **S** | Zod schemas validate partial updates on admin routes. | Rerun `TC-F25` |
| **TASK-011**| Align 404 Catch-All Response Format | GAP-006 | Backend Dev | **P2** | **XS** | 404 catch-all matches `{ success: false, message: string, error: { code, errorCode, message } }`. | Rerun `TC-INT-04` |
| **TASK-012**| Elevate CI Coverage Threshold to 70% | GAP-004 | SDET | **P2** | **XS** | `thresholds` in `vitest.config.mts` updated. | Rerun `npm run test:coverage` |

### Group 3: NICE TO HAVE (P3)
| TASK ID | Actionable Task | Related Finding IDs | Assigned Owner | Priority | Effort | Done When | Retest Plan |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **TASK-013**| Prune Unused Packages (`winston`, `axios`) | GAP-002 | DevOps | **P3** | **XS** | `package.json` cleaned of unreferenced packages. | Rerun `npm run build` |

---

## 10C. Master Do-Not Rules

### General Enterprise Quality Rules:
1. No production release with open Critical or High severity defects.
2. No real customer data, live credit cards, or production PII in test environments.
3. No load, stress, or security tests executed against production URLs.
4. No hardcoded credentials, secret keys, or tokens in source code or committed test files.
5. No skipped regression testing following code fixes or hotfixes.
6. No "Pass" status reported without real, reproducible command or file evidence.
7. No testing restricted exclusively to happy paths.
8. No loose mocks that always pass regardless of implementation correctness.
9. No new feature branches merged during Gamma release candidate freeze.
10. No ignored flaky tests; all must be quarantined and investigated.
11. No lowering or disabling coverage thresholds to force green CI builds.
12. No production deployment without verified database backup and documented rollback runbook.
13. No visual/responsive sign-off without multi-viewport screenshot verification.
14. Never trust AI-generated code, tests, or assertions without independent manual validation.
15. Never accept an assertion about the system without an evidence citation tag.

### 10 Stack-Specific Rules Derived from Findings:
16. **DO NOT** mutate user role to `SELLER` upon application submission without preserving consumer cart/checkout capabilities (**BUG-005**).
17. **DO NOT** hardcode `http://localhost:5000` in email dispatch services or authentication redirect templates (**BUG-001**).
18. **DO NOT** execute `prisma.address.delete` without handling existing foreign key references in `Order.shippingAddressId` (**BUG-003**).
19. **DO NOT** verify JWT tokens without an explicit algorithm whitelist (`{ algorithms: ['HS256'] }`) (**BUG-007**).
20. **DO NOT** reflect raw `err.message` from Prisma exceptions back to API clients (**BUG-006**).
21. **DO NOT** pass raw `req.body` directly to `productService.createProduct` or admin update services without Zod schema validation (**BUG-008**, **BUG-009**).
22. **DO NOT** permit review creation without checking order delivery history and setting `isVerifiedPurchase` (**BUG-004**).
23. **DO NOT** ignore replay of revoked refresh tokens; always invalidate the full session family upon reuse detection (**BUG-002**).
24. **DO NOT** deploy frontend web builds to production without automated unit/component testing in CI (**GAP-001**).
25. **DO NOT** leave unreferenced packages (`winston`, `axios`) declared in `Backend/package.json` (**GAP-002**).

---

## 10D. Summary of Biggest Remaining Release Risk

> **Primary Release Risk:** The most severe release blocker is **BUG-005 (Architectural Role Lockout)** combined with **BUG-003 (Address Foreign Key Deletion Crash)** and **BUG-008 (Unvalidated Product Mutation)**. When any customer applies to become a seller, their role in PostgreSQL is immediately changed to `SELLER`, which instantly triggers HTTP 403 Forbidden on the consumer cart and order routes, permanently preventing them from buying items on AkMart. Coupled with unvalidated product creation controllers that can crash on empty strings and missing foreign key handling on address deletion, releasing the application in its current state would lead to severe user lockouts and unexpected HTTP 500 runtime crashes during standard multi-vendor marketplace workflows.

---

## Phase 10 Verification Checklist

| Checklist Item | Verified | Evidence / Rationale |
| :--- | :---: | :--- |
| **Every gap backed by real evidence?** | **YES** | All 10 gaps quote exact file paths and line numbers. |
| **Every open bug mapped to a TASK?** | **YES** | BUG-001 through BUG-009 mapped to TASK-001 through TASK-012 with priority and owners. |
| **Stack-specific do-nots linked to findings?** | **YES** | Rules 16-25 each cite the exact BUG-xxx or GAP-xxx ID. |
| **Risk summary concise and grounded?** | **YES** | Focuses strictly on verified findings (BUG-005, BUG-003, BUG-008). |
