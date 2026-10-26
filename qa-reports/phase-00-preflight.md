# Phase 0: Pre-Flight and Environment Readiness Report
**Date:** 2026-10-26  
**Auditor:** Principal QA Architect / Senior SDET  
**System:** AkMart Multi-Vendor E-Commerce Platform  
**Branch:** `qa-testing`  

---

## 1. System & Technology Stack Detection

### Backend Stack
- **Runtime & Language:** Node.js (v20+ recommended in CI), TypeScript 5.9.3, CommonJS module format.
- **Web Framework:** Express 5.2.1 (`Backend/package.json:31`).
- **ORM / Database:** Prisma 5.22.0 (`Backend/package.json:25,39`), PostgreSQL 15/16 (`docker-compose.yml:4`, `.github/workflows/ci.yml:65`).
- **Cache & Rate Limiting:** Redis 7 via `ioredis` 6.0.0 (`Backend/package.json:35`), `rate-limit-redis` 6.0.1, `express-rate-limit` 8.7.0.
- **Authentication:** `jsonwebtoken` 9.0.3, `bcryptjs` 3.0.3, `google-auth-library` 11.1.0, `cookie-parser` 1.4.7.
- **Validation & Utilities:** `zod` 4.6.5, `nanoid` 6.0.1, `slugify` 1.6.9, `nodemailer` 10.0.10.
- **Existing Test Framework:** 
  - Test Runner: `vitest` 5.0.1 (`Backend/package.json:67`)
  - Integration/API: `supertest` 7.2.2 (`Backend/package.json:63`)
  - Load Testing: `artillery` 2.0.34 (`Backend/package.json:59`)
  - Coverage: `@vitest/coverage-v8` 5.0.5 (`Backend/package.json:58`)
- **Backend Scripts Available:**
  - `dev`: `tsx watch src/server.ts`
  - `build`: `tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json`
  - `start`: `node dist/server.js`
  - `start:prod`: `sh ./start.sh`
  - `lint`: `eslint src/`
  - `test`: `vitest run --exclude dist`
  - `test:coverage`: `vitest run --exclude dist --coverage`
  - `test:watch`: `vitest`
  - `prisma:seed`: `tsx prisma/seed.ts`

### Frontend Stack
- **Build Tool & Framework:** Vite 7.2.4, React 19.2.0, React DOM 19.2.0 (`Frontend/package.json:16-17,37`).
- **Language:** TypeScript 7.0.2 / JSX (`Frontend/package.json:36`).
- **Styling:** TailwindCSS 3.4.18, PostCSS 8.5.6, Autoprefixer 10.4.22 (`Frontend/package.json:29,34,35`).
- **State Management & Data Fetching:** Zustand 5.0.15, TanStack React Query 5.103.1 (`Frontend/package.json:14,21`).
- **Routing:** `react-router-dom` 7.9.6 (`Frontend/package.json:19`).
- **Icons & UI Feedback:** `react-icons` 5.5.0, `react-toastify` 11.0.5 (`Frontend/package.json:18,20`).
- **Existing Test Framework:** **NONE** currently installed in `Frontend/package.json`. No Vitest, Jest, Testing Library, Playwright, or Cypress packages present.
- **Frontend Scripts Available:**
  - `dev`: `vite`
  - `build`: `vite build`
  - `lint`: `eslint .`
  - `preview`: `vite preview`

---

## 2. Environment Readiness & Service Verification

| Service | Target Host:Port | Live Verification Evidence | Health Status |
| :--- | :--- | :--- | :--- |
| **Backend API** | `http://localhost:5000` | [OUTPUT: `http://localhost:5000/health`] -> `{"status":"ok","message":"All systems operational"}` | **HEALTHY / OPERATIONAL** |
| **Frontend Web** | `http://localhost:5173` | [OUTPUT: `http://localhost:5173`] -> HTML title: `AKMart \| Online Shopping Nepal`, root container mounted | **HEALTHY / OPERATIONAL** |
| **PostgreSQL** | `localhost:5432` / `5433` | Confirmed via Backend `/health` connection probe `prisma.$queryRaw\`SELECT 1\`` | **CONNECTED** |
| **Redis** | `localhost:6379` / `6380` | Confirmed via Backend `/health` probe `redis.ping()` | **CONNECTED** |

---

## 3. Environment Variables Audit (Variable Names Only)

### Backend Required (`Backend/src/config/env.ts`):
- Core: `PORT`, `NODE_ENV`
- Database & Cache: `DATABASE_URL`, `REDIS_URL`
- Auth & Security: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_ACCESS_EXPIRES_IN_MS`, `JWT_REFRESH_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN_MS`, `GOOGLE_CLIENT_ID`, `OTP_EXPIRES_IN_MS`, `BCRYPT_SALT_ROUNDS`, `DEFAULT_USER_ROLE`
- Rate Limiting: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`, `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX_REQUESTS`
- URLs: `FRONTEND_WEB_URL`, `FRONTEND_MOBILE_URL`
- Optional Services: `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`

### Frontend Required (`Frontend/.env.example`):
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

---

## 4. Test Database Isolation Check
- In `Backend/.env.test:2`:
  `DATABASE_URL="postgresql://akmart_user:akmart_password@localhost:5432/akmart_test_db?schema=public"`
- In CI workflow `.github/workflows/ci.yml:69,95`:
  `POSTGRES_DB: akmart_test`
- **Result:** Test DB is designated as `akmart_test_db` / `akmart_test`, isolated from development database `akmart_dev` / `akmart_db`.

---

## 5. Security & Secrets Protection Check
- `.gitignore` properly excludes `.env`, `.env.*` (except `.env.example`), `PRODUCTION_SECRETS.md`, `*.pem`, `*.key`, `*.cert`.
- No raw secret values have been printed, exposed, or committed to logs.
- Compliance with Rule S3 is maintained.

---

## 6. Git Branch & Status
- **Current Branch:** `qa-testing` [CODE: `.git/HEAD:1`]
- The workspace is already operating on an isolated QA testing branch, satisfying the branch recommendation.

---

## 7. Blockers & Gaps Identified for Automated Testing

1. **Frontend Testing Infrastructure Absent:** `Frontend/package.json` contains no test runner, testing library, or E2E framework (Playwright/Cypress). All frontend automated verification will require either installing devDependencies (with explicit user approval per Rule S2) or running Playwright/Vitest from dedicated test runners.
2. **Local Test DB Sync:** Verification needed whether `akmart_test_db` schema has been deployed with Prisma migrations before executing backend Vitest suites that touch the database.
3. **Third-Party Integrations Mocking Required:** Email (Nodemailer/SMTP), Payment (eSewa/Khalti), and Cloud Storage (AWS S3) must operate with mocks or local sandbox handlers to prevent live external calls per Rule S4.

---

## 8. Pre-Flight Verification Checklist

| Checklist Item | Status | Reason / Evidence |
| :--- | :---: | :--- |
| **Does the app start?** | **YES** | Backend active on port 5000 (`/health` returns 200 OK); Frontend active on port 5173. |
| **Test DB isolated?** | **YES** | `Backend/.env.test` targets `akmart_test_db`, separate from development database `akmart_dev`. |
| **No secrets exposed?** | **YES** | Strict compliance with Rule S3: only variable names reported; `.env` protected in `.gitignore`. |
| **Blockers listed?** | **YES** | Frontend test runner absence, test DB migration state, and mock requirements documented above. |
| **Branch verified?** | **YES** | Verified on branch `qa-testing` via `.git/HEAD`. |
| **/qa-reports & /tests created?** | **YES** | Created in repository root structure. |
