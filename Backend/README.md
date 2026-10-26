# ⚙️ AkMart Backend API Engine

The core backend service for the **AkMart Multi-Vendor E-Commerce Platform**, built with **Node.js**, **Express 5**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, **Redis**, and **Backblaze B2 / S3 Cloud Storage**.

---

## 🚀 Key Architectural Highlights

- **Modular Monolith**: Strict separation of concerns (Routes ➡️ Controllers ➡️ Services ➡️ Prisma ORM Data Layer).
- **Zod-Validated Environment**: Fast-fail startup validation in [`src/config/env.ts`](src/config/env.ts).
- **Zero-Disk-Buffering Storage**: Streaming direct multipart uploads via `busboy` and `@aws-sdk/lib-storage` directly to Backblaze B2.
- **Magic-Byte Sniffing**: Inspects binary signatures to reject spoofed executable payloads.
- **Token Security**: Dual-token authentication with short-lived JWT access tokens (`15m`) and rotating refresh tokens (`7d`) with Redis revocation tracking.
- **Anti-Abuse & Rate Limiting**: Sliding window rate limiters protecting authentication, registration, and file upload endpoints.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v24`
- PostgreSQL `16+` (or Docker)
- Redis `7+` (or Docker)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL`, `REDIS_URL`, and your Backblaze B2 credentials in `.env`.

### 3. Database Migration & Seeding
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed initial roles, admin, seller, and sample products
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```
API runs at 👉 `http://localhost:5000` (Healthcheck: `http://localhost:5000/health`).

### 5. Automated Tests & Type Checking
```bash
# Run Vitest test suite (105 tests across 15 suites)
npm test

# Run TypeScript compilation check
npx tsc -p tsconfig.json --noEmit

# Run ESLint analysis
npm run lint
```

---

## 📁 Backend Directory Structure

```
Backend/
├── prisma/                 # Prisma schema, migrations & seed script
│   ├── schema.prisma       # Full PostgreSQL database schema
│   └── seed.ts             # Idempotent database seeder
├── src/
│   ├── config/             # Environment validation (Zod)
│   ├── controllers/        # Express HTTP controllers
│   ├── lib/storage/        # Cloud Storage abstraction (B2/S3/Local)
│   │   ├── index.ts        # Storage service singleton & methods
│   │   ├── keyGenerator.ts # Unguessable UUID key generator
│   │   └── magicBytes.ts   # Binary file signature validator
│   ├── middlewares/        # Auth, RBAC, Rate Limiter, Error handling
│   ├── routes/             # REST route declarations
│   ├── services/           # Domain business logic & transactions
│   ├── types/              # Express & domain TypeScript types
│   ├── utils/              # Token helpers, Logger, AppError
│   ├── app.ts              # Express application setup & Helmet CORP
│   └── server.ts           # HTTP server bootstrapper
├── .env.example            # Production & local environment template
├── Dockerfile              # Multi-stage production container build
├── start.sh                # Production startup script (migrate + seed + start)
└── package.json            # Scripts and dependencies
```
