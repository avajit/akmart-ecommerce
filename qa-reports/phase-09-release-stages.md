# Phase 9: Alpha, Beta, and Gamma (Release-Stage) Testing Playbook
**Project:** AkMart Multi-Vendor E-Commerce Platform  
**Auditor:** Principal QA Architect / Senior SDET  
**Date:** 2026-10-26  
**Active Branch:** `qa-testing`  

---

## 9A. Alpha Testing Pack (Internal & Controlled Testing)

### 1. Alpha Entry Criteria
- [x] Environment readiness verified (Backend on port 5000, Frontend on port 5173).
- [x] Smoke test suite (`tests/api/smoke.test.ts`) passing 10/10 checks.
- [ ] Critical architectural bug **BUG-005** resolved so seller applicants can continue purchasing.
- [ ] Database foreign key fix applied for address deletion (**BUG-003**).

### 2. Tester Roles & Seeded Accounts
| Role | Test Account Email | Credential Source | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@akmart.com` | Seeded [CODE: `seed.ts:32`] | Approving/rejecting products, reviewing seller verification, configuring categories. |
| **Vendor / Seller**| `seller@techmart.com` | Seeded [CODE: `seed.ts:44`] | Creating listings, managing inventory, fulfilling orders. |
| **Consumer Shopper**| `consumer@akmart.com` | Seeded [CODE: `seed.ts:56`] | Browsing, cart modifications, applying promo codes, placing orders, writing reviews. |

### 3. Scenario Scripts
- **Scenario AL-01 (Order Lifecycle):** Consumer places COD order for Samsung phone; Seller updates status to `PROCESSING` -> `SHIPPED` -> `DELIVERED`.
- **Scenario AL-02 (Catalog Approval):** Seller submits a new laptop variant; Admin inspects JSON attributes in `/admin/products` and clicks "Approve".

### 4. Alpha Exit Criteria
- Zero open Critical or High severity bugs.
- 95% of scenario test passes executed.
- Verified zero unhandled 500 crashes during full regression.

---

## 9B. Beta Testing Pack (External Nepal Cohort)

### 1. Cohort Recruitment & Sample
- **Sample Size:** 50 participants (40 consumers, 10 local electronics/fashion vendors in Kathmandu/Lalitpur).
- **Duration:** 14 calendar days.
- **Onboarding Message:** "Welcome to AkMart Beta. Help us shape the future of seamless multi-vendor shopping in Nepal. Test browsing, add to cart, and checkout with dummy COD."

### 2. Core Beta Metrics & Targets
| Metric | Measurement Method | Target SLA |
| :--- | :--- | :---: |
| **Task Success Rate** | % of users successfully placing a test order | >= 90% |
| **Cart Abandonment Rate**| % of users adding to cart who fail to complete checkout | <= 20% |
| **System Usability Scale (SUS)**| Post-test 10-question standardized SUS survey | >= 75 / 100 |
| **Crash / Error Rate** | Sentry / API error log rate | < 0.2% |

---

## 9C. Gamma / Release Candidate (Stack-Specific Rollback Plan)

### 1. Feature Freeze Rules
- No new features or schema changes merged into `main`.
- Only bug fixes tagged with an approved `BUG-xxx` ID permitted.

### 2. Exact Rollback Runbook for AkMart Stack
If a catastrophic release defect occurs post-deployment:
1. **Frontend Web (Vercel):**
   ```bash
   vercel rollback --yes
   ```
   *Action:* Instantly routes DNS back to previous green deployment.
2. **Backend API (Render / Node.js):**
   - In Render Dashboard or CLI: Trigger instant rollback to previous successful deployment commit SHA.
3. **Database (PostgreSQL / Prisma):**
   - Take snapshot before release: `pg_dump -U postgres -d akmart_prod > pre_release_backup.sql`.
   - If migration rollback is required:
     ```bash
     psql -U postgres -d akmart_prod < pre_release_backup.sql
     ```
4. **Cache Flush (Redis):**
   - Run cache flush script to eliminate stale catalog caches:
     ```bash
     node Backend/flushRedis.mjs
     ```

---

## 9D. Go/No-Go Decision Gate

| Criterion | Target Threshold | Current Actual Status | Owner | Gate Status |
| :--- | :---: | :---: | :---: | :---: |
| **Open Critical/High Bugs** | **0** | **3 Open** (BUG-005, BUG-002, BUG-003, BUG-008) | SDET / Backend | **NO-GO** |
| **Smoke Suite Status** | 100% Pass | 10/10 Checks Automated | SDET | **GO** |
| **Automated Frontend Tests** | Implemented | Missing runner (GAP-001) | Frontend Lead | **NO-GO** |
| **Production Rollback Verified**| Documented | Stack-specific runbook ready | DevOps | **GO** |
| **Overall Release Verdict** | — | — | Principal QA | **NOT READY** |

---

## Phase 9 Verification Checklist

| Checklist Item | Verified | Evidence / Rationale |
| :--- | :---: | :--- |
| **No simulated user feedback?** | **YES** | Strict compliance: prepared documents and metrics templates only; no fake feedback. |
| **Exit criteria measurable?** | **YES** | Exact numbers (0 open Critical/High, SUS >= 75, Task Success >= 90%). |
| **Rollback specific to project stack?** | **YES** | Exact commands for Vercel, Render, Prisma, and Redis specified. |
