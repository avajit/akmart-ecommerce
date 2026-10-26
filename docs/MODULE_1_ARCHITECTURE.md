# Module 1: Enterprise Foundation & Security Architecture

**Goal**: Build a rock-solid, highly secure, and scalable backend foundation capable of horizontally scaling to support high traffic (Nepal market), while remaining pragmatic for v1 development without over-engineering prematurely.

## 🏗️ 1. Infrastructure & Scaling Strategy
- **Cluster Mode (PM2) & Graceful Shutdown:** Node.js runs via PM2 in cluster mode. We will implement `process.on('SIGTERM')` to close Prisma and Redis connections cleanly, preventing connection leaks and dropped requests on restarts.
- **Stateless Architecture:** No session data saved in Node.js RAM. State is shared via Redis or PostgreSQL.
- **Database Connection Pooling:** Prisma connection pooling via PgBouncer prevents DB crashes at scale.
- **AWS Region Selection:** We will deploy to **AWS Mumbai (ap-south-1)** for the lowest possible latency to Nepal ISPs (Worldlink, NTC, Ncell).
- **Health Checks:** A dedicated `/health` endpoint to monitor DB + Redis connectivity for orchestrators/load balancers.
- **Logging & Observability:** Structured logging using `Winston` or `Pino` and error tracking (e.g., Sentry) will be set up immediately, not bolted on later.

## 🔐 2. Enterprise Security Layers
1. **Redis Rate Limiting:** Global limits (DDoS protection), Auth limits (brute-force protection), and granular per-user limits for endpoints like "add to cart".
2. **Helmet.js & Body Size Limits:** Secure HTTP headers and `express.json({ limit: '10kb' })` to prevent large-payload DoS attacks.
3. **Strict CORS & CSRF Protection:** Strict origins for Web/Mobile. Because we use `HttpOnly` cookies for Refresh Tokens, we are exposed to CSRF. We will implement `SameSite=Strict` (or Lax) and CSRF token checks on state-changing routes.
4. **Input & Env Validation:** We will use `zod` to validate all incoming request bodies AND to validate `process.env` on startup, ensuring the server refuses to boot with missing config.
5. **Secrets Management:** JWT secrets and DB URLs will be managed securely, ensuring `.env` is git-ignored with a clear rotation plan. Passwords hashed using `bcrypt` with a deliberate cost factor (e.g., 10-12) to balance security and login speed.

## 🔑 3. Advanced Authentication (Dual JWT + SSO)
- **Access Token:** Short-lived (15 mins) in headers, containing the User ID and permissions to avoid DB hits.
- **Refresh Token (Isolated Table):** Stored in a separate `RefreshToken` table (not as a single string on the User). This allows multiple concurrent sessions (phone + laptop) and "logout from all devices" functionality. Stored in a secure `HttpOnly` cookie.
- **Google SSO Account Linking:** If a user signs up with email/password and later uses Google SSO with the same email, the accounts will automatically link to prevent duplicates.
- **Email & Phone Verification:** Dedicated `VerificationToken` table for OTP flows and password resets. **Phone number (`phoneNumber`) is a first-class field** since it's highly trusted in Nepal for COD confirmation and login.

## 🛡️ 4. Dynamic RBAC & Audit Logging
- **Dynamic Permissions:** Roles and Permissions are defined in DB tables and cached in Redis/JWT.
- **Seed Scripts:** `prisma/seed.ts` ensures fresh environments instantly have the `SUPER_ADMIN` role and core permissions.
- **Audit Logs:** An `AuditLog` table will track sensitive actions (refunds, bans, price changes) for dispute resolution.

## 🕰️ 5. Localization & Data Integrity
- **Timezone Handling:** Nepal is UTC+5:45. The DB will store everything in UTC natively, and all display logic / cron jobs will explicitly convert to Nepal time.
- **Soft Deletes:** `deletedAt` timestamps will be used for Products, Orders, and Users instead of hard deletes to maintain order history integrity (e.g., if a product is deleted, past orders still need to reference it).

## 🗄️ 6. Database Schema (Prisma ORM)

```prisma
// schema.prisma

model User {
  id               String   @id @default(uuid())
  email            String?  @unique
  phoneNumber      String?  @unique // Crucial for Nepal market
  passwordHash     String?  
  googleId         String?  @unique
  fullName         String
  
  roleId           String
  role             Role     @relation(fields: [roleId], references: [id])
  
  isEmailVerified  Boolean  @default(false)
  isPhoneVerified  Boolean  @default(false)
  isActive         Boolean  @default(true) 
  avatarUrl        String?
  
  deletedAt        DateTime? // Soft delete strategy
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  refreshTokens    RefreshToken[]
  auditLogs        AuditLog[]

  @@index([email]) 
  @@index([phoneNumber])
}

// 1. Fix: Separate Refresh Token table for multi-device support
model RefreshToken {
  id          String   @id @default(uuid())
  tokenHash   String   @unique
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  deviceInfo  String?
  expiresAt   DateTime
  revokedAt   DateTime?
  createdAt   DateTime @default(now())
}

// 2. Fix: Verification flow for Emails / Password Resets
model VerificationToken {
  id          String   @id @default(uuid())
  identifier  String   // Email or phone number
  token       String   @unique
  type        String   // e.g., 'EMAIL_VERIFY', 'PASSWORD_RESET'
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}

// 3. Fix: Audit logging for enterprise security
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  action      String
  entity      String   // e.g., 'PRODUCT', 'ORDER'
  entityId    String
  details     Json?
  createdAt   DateTime @default(now())
}

// RBAC System
model Role {
  id          String   @id @default(uuid())
  name        String   @unique 
  description String?
  users       User[]
  permissions RolePermission[]
}

model Permission {
  id          String   @id @default(uuid())
  action      String   @unique 
  description String?
  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}
```

## 🚀 7. Action Plan (Execution Steps)
1. Initialize strict TypeScript environment and install dependencies (Express, Prisma, Redis, JWT, bcrypt, zod, helmet, winston for structured logging).
2. Write `zod` schema to validate `process.env` on startup.
3. Setup Prisma Schema (incorporating soft deletes, audit logs, verification tokens) and `prisma/seed.ts`.
4. Build Middlewares: Graceful shutdown handlers, Redis Rate Limiter, Helmet, CORS, CSRF checks, Request Body Size Limits, Zod Input Validation, and Health Check endpoint.
5. Build Auth Controllers: Register, Login (bcrypt cost 12), Google SSO linking, Multi-device Refresh Tokens, and Logout logic.


///////////////////////////////////////////////////////


# Module 1: Enterprise Foundation & Security Architecture (Complete — All 27 Points)

**Goal**: Build a rock-solid, secure, horizontally-scalable backend foundation for a Nepal-based e-commerce platform (Flipkart/Amazon-style), built correctly from day one without over-engineering for traffic you don't have yet.

---

## ✅ Master Checklist (All 27 Points)

### 🏗️ Infrastructure & Scaling
1. **Cluster Mode (PM2):** Run Node.js via PM2 in cluster mode (1 process per CPU core).
2. **Stateless Architecture:** No session data in Node.js RAM — everything in Redis/PostgreSQL so any number of servers can share state.
3. **Database Connection Pooling (PgBouncer):** Prisma's own pooling isn't enough at scale — use **PgBouncer** (or Prisma Accelerate) in front of Postgres, since each PM2 process + each server multiplies open connections.
21. **Graceful Shutdown:** `process.on('SIGTERM', ...)` to cleanly close Prisma + Redis connections on PM2 restart/reload — prevents connection leaks and dropped requests on every deploy.
24. **AWS Region Selection:** Deploy to **AWS Mumbai (ap-south-1)** — lowest latency to Nepal ISPs (Worldlink, NTC, Ncell) vs US/EU regions.
7. **Health Check Endpoint:** `/health` route checking DB + Redis connectivity, for load balancers/orchestrators.
6. **Logging & Observability:** Structured logging (Winston/Pino) + error tracking (Sentry) set up from the start, not bolted on later.

### 🔐 Security Layers
4. **Redis Rate Limiting:** Global limit (e.g. 100 req/min/IP for DDoS), strict Auth limit (5 failed logins/15min), and **per-user granular limits** (e.g. on "add to cart") once authenticated.
5. **Helmet.js:** Secure HTTP headers against clickjacking/sniffing.
23. **Request Body Size Limits:** `express.json({ limit: '10kb' })` — without this, large payloads are a cheap DoS vector even behind rate limiting.
17. **CSRF Protection:** Since Refresh Token lives in an `HttpOnly` cookie, add `SameSite=Strict`/`Lax` + CSRF token checks on state-changing routes.
18. **Input Validation (Zod/Joi):** Validate every incoming request body (email format, password strength, required fields) at the API boundary before it hits controllers.
19. **Bcrypt Cost Factor:** Deliberately choose salt rounds (10–12) — too low is weak, too high becomes a DoS vector under heavy login/signup traffic.
22. **Secrets Management:** `.env` git-ignored, documented JWT secret rotation plan; consider a secrets manager (AWS Secrets Manager/Doppler) as you grow.
5b. **Strict CORS:** Only your specific Web and React Native domains accepted.
4b. **Data Sanitization:** Prevent NoSQL/SQL injection and XSS.

### 🔑 Authentication
- **Access Token:** Short-lived (15 min), sent in headers.
- **Refresh Token — Isolated Table (Fix #1):** Separate `RefreshToken` table (not a single string on `User`) — supports multiple concurrent sessions (phone + laptop) and "logout from all devices."
9. **Google SSO Account Linking:** If a user registers with email/password and later signs in with Google using the same email, auto-link accounts instead of creating a duplicate user.
2. **Email/Password Verification (Fix #2):** Dedicated `VerificationToken` table for email verification + password reset flows.
26. **Phone Number as First-Class Field:** In Nepal, phone is trusted more than email for OTP login, delivery contact, and COD confirmation. `phoneNumber` is a top-level, unique field on `User` — not retrofitted later.
8. **CORS/Cookie Behavior for Mobile:** React Native doesn't handle cookies like a browser — plan explicitly how the Refresh Token reaches mobile clients (e.g. secure storage + header) vs the web cookie flow.

### 🛡️ Dynamic RBAC & Permissions
- **Dynamic Permissions System:** Roles/Permissions stored in DB tables, not hardcoded enums — Super Admin can create/edit roles without redeploying code.
14. **Redis-Only Permission Caching (Fix — not JWT-embedded):** Cache permissions in Redis, **not** inside the JWT payload — otherwise a demoted/banned user's stale permissions remain valid until their 15-min Access Token naturally expires.
16. **`isSystem` Flag on Role:** Protects core roles (e.g. `SUPER_ADMIN`) from being renamed/deleted accidentally through the dynamic RBAC UI.
15. **Never Hardcode Against `Role.name`:** Always check against a `Permission.action` string, not a role name, since names are renamable.
16b. **`RolePermission.assignedAt`:** Timestamp for audit purposes — know when a permission was granted to a role.
3. **Audit Log Table:** Tracks sensitive actions (refunds, bans, price changes, permission changes) — critical for e-commerce dispute resolution.

### 🕰️ Data Integrity & Localization
4c. **Soft Deletes:** `deletedAt` timestamp on Users/Products/Orders instead of hard deletes — preserves order history integrity even after a product/user is removed.
25. **Timezone Handling:** Nepal is UTC+5:45. Store everything in UTC in the DB; explicitly convert to Nepal time in display logic and any cron/scheduled jobs.
13. **Auth Requires At Least One Identifier:** Since `email`, `phoneNumber`, and `googleId` are all optional individually, enforce at the service layer that every user has **at least one** of `passwordHash` / `googleId` — otherwise a user could be created with no way to log in.

### ⚙️ Process & Project Setup (not schema, but required before coding)
20. **Seed Script (`prisma/seed.ts`):** Fresh environments (staging, teammate's laptop, CI) need `SUPER_ADMIN` role + core permissions to exist immediately — app is unusable on a blank DB otherwise.
11. **Folder Structure:** Lock in `controllers/ services/ repositories/ middlewares/ routes/ utils/ config/` now — separating business logic from HTTP handling avoids painful refactors after Module 2, 3, etc.
12. **Standardized Error Response Shape:** One consistent JSON error format (`{ success, error: { code, message } }`) via a central `AppError` class + error-handling middleware.
13b. **API Versioning:** Prefix all routes with `/api/v1/...` from day one — trivial now, painful to retrofit once mobile apps are live.
10. **Testing Setup:** Jest or Vitest, with at least a basic test suite for the register/login/refresh flow — auth bugs are the most dangerous kind to ship.
10b. **Git Workflow / Docker:** `.env.example`, `.env.development`, `.env.production` conventions; `dev/staging/main` branches; `docker-compose.yml` for local Postgres + Redis.
27. **Realistic Scale Framing:** Build correctly (stateless, pooled, Redis-cached) so it *can* scale to 1M DAU / 100k concurrent later — but don't spend Module 1 time load-testing or tuning for numbers you won't hit until you have real users.

---

## 🗄️ Final Prisma Schema (with all schema-level fixes applied)

```prisma
// schema.prisma

model User {
  id               String   @id @default(uuid())
  email            String?  @unique
  phoneNumber      String?  @unique // Crucial for Nepal market (#26)
  passwordHash     String?
  googleId         String?  @unique
  fullName         String

  roleId           String
  role             Role     @relation(fields: [roleId], references: [id])

  isEmailVerified  Boolean  @default(false)
  isPhoneVerified  Boolean  @default(false)
  isActive         Boolean  @default(true)
  avatarUrl        String?

  deletedAt        DateTime? // Soft delete strategy (#4c)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  refreshTokens    RefreshToken[]
  auditLogs        AuditLog[]

  // App-level rule (#13): enforce in service layer, not DB constraint —
  // every user must have at least one of passwordHash / googleId / phoneNumber+OTP

  @@index([email])
  @@index([phoneNumber])
}

// Fix #1: Separate Refresh Token table for multi-device support
model RefreshToken {
  id          String    @id @default(uuid())
  tokenHash   String    @unique
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  deviceInfo  String?
  expiresAt   DateTime
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
}

// Fix #2: Verification flow for Email / Phone / Password Resets
model VerificationToken {
  id          String   @id @default(uuid())
  identifier  String   // Email or phone number
  token       String   @unique
  type        String   // 'EMAIL_VERIFY' | 'PHONE_VERIFY' | 'PASSWORD_RESET'
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}

// Fix #3: Audit logging for enterprise security (#3)
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  action      String
  entity      String   // e.g. 'PRODUCT', 'ORDER', 'ROLE'
  entityId    String
  details     Json?
  createdAt   DateTime @default(now())
}

// RBAC System
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  isSystem    Boolean  @default(false) // Fix #16: protects core roles from rename/delete

  users       User[]
  permissions RolePermission[]
}

model Permission {
  id          String   @id @default(uuid())
  action      String   @unique // e.g. 'CREATE_PRODUCT', 'DELETE_ANY_PRODUCT', 'VIEW_SALES'
  description String?

  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  assignedAt   DateTime   @default(now()) // Fix #16b: audit trail for permission grants

  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])
}
```

---

## 🚀 Action Plan (Execution Order)

1. **Module 0 setup:** folder structure (#11), Docker Compose for local Postgres+Redis (#10b), `.env.example`, `dev/staging/main` git branches.
2. Initialize strict TypeScript environment; install Express, Prisma, Redis, JWT, bcrypt, zod, helmet, winston/pino, PgBouncer config.
3. Write `zod` schema to validate `process.env` on startup (fails fast on bad config).
4. Build the standardized `AppError` class + central error-handling middleware (#12); prefix all routes with `/api/v1` (#13b).
5. Set up Prisma schema above, run first migration, write `prisma/seed.ts` (#20) for `SUPER_ADMIN` role + core permissions.
6. Build middlewares: graceful shutdown (#21), Redis rate limiter (global + auth + per-user), Helmet, CORS, CSRF, body size limit, Zod input validation, `/health` endpoint, request correlation IDs.
7. Build Auth Controllers: Register (email or phone), Login (bcrypt cost 12), Google SSO with account linking, multi-device Refresh Token issuance/rotation, Logout (single + all devices), Email/Phone verification, Password reset.
8. Decide and implement the mobile refresh-token delivery strategy (#8) — secure storage + header for React Native vs. HttpOnly cookie for Web.
9. Write basic Jest/Vitest tests (#10) for the full register → login → refresh → logout flow.
10. Deploy skeleton to AWS Mumbai (ap-south-1) (#24), confirm `/health` responds, confirm logs/Sentry are capturing events.