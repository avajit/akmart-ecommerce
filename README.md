# 🛒 AkMart – Enterprise Multi-Vendor E-Commerce Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-teal.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-105%20Passed-brightgreen.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

**AkMart** is an enterprise-grade, full-stack multi-vendor marketplace platform inspired by Amazon and Flipkart, tailored specifically for the Nepal market and global cross-border scale. 

Built with **React 19**, **Express 5**, **Prisma ORM**, **PostgreSQL**, **Redis**, and **Backblaze B2 / S3 Cloud Storage**, it provides strict role-based access control, zero-disk-buffering media pipelines, dynamic category attribute filtering, and transactional integrity.

---

## 📑 Table of Contents
1. [System Architecture](#-system-architecture)
2. [Technology Stack](#-technology-stack)
3. [Key Modules & Capabilities](#-key-modules--capabilities)
4. [Database & Domain Modeling](#-database--domain-modeling)
5. [REST API Directory](#-rest-api-directory)
6. [Local Development Setup](#-local-development-setup)
7. [Default Test Accounts](#-default-test-accounts)
8. [Automated Testing & Code Quality](#-automated-testing--code-quality)
9. [Production Deployment (Render + Vercel)](#-production-deployment-render--vercel)
10. [Environment Variables Reference](#-environment-variables-reference)

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Clients ["Client Applications"]
        Web["Web Storefront & Portals\n(React 19 + Vite 7 + Tailwind)"]
        Mobile["Mobile App (Planned)\n(React Native / Expo)"]
    end

    subgraph CDN ["CDN & Ingress"]
        VercelEdge["Vercel Edge Network\n(Static Assets & SPA Rewrites)"]
    end

    subgraph BackendGateway ["API Gateway & Core Engine (Render)"]
        ExpressApp["Express 5 REST API\n(TypeScript Modular Monolith)"]
        Helmet["Security Headers & CORP\n(Cross-Origin Resource Policy)"]
        RateLimiter["Redis Sliding Window Limiter\n(Anti-DDoS & Brute Force)"]
        AuthMiddleware["JWT & RBAC Gatekeeper\n(Consumer / Seller / Admin)"]
    end

    subgraph DataTier ["Data & Cache Tier"]
        PostgreSQL[("PostgreSQL\n(Prisma ORM - ACID Transactions)")]
        RedisCache[("Redis 7\n(Sessions, OTPs, Revocations)")]
    end

    subgraph StorageTier ["Cloud Object Storage"]
        B2["Backblaze B2 / AWS S3\n(Direct Streaming via Busboy)"]
    end

    Web --> VercelEdge
    VercelEdge -->|REST API / Credentials| Helmet
    Mobile --> Helmet
    Helmet --> RateLimiter
    RateLimiter --> AuthMiddleware
    AuthMiddleware --> ExpressApp
    ExpressApp -->|Queries & Transactions| PostgreSQL
    ExpressApp -->|Cache & Revocation| RedisCache
    ExpressApp -->|Pipes File Streams| B2
```

---

## 💻 Technology Stack

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.0` | High-performance reactive UI with modern hooks |
| **Build Tool** | Vite | `^7.2.4` | Sub-second HMR & optimized production chunking |
| **State Management** | Zustand | `^5.0.15` | Micro-stores for Auth, Cart, and Toast notifications |
| **Server Cache Sync** | TanStack React Query | `^5.103.1` | Automated query invalidation and optimistic mutations |
| **Styling & Icons** | Tailwind CSS & React Icons | `^3.4.18` | Standardized dark/zinc palette & accessible vector SVGs |
| **Backend Runtime** | Node.js | `v20+` / `v24` | JavaScript runtime environment |
| **API Framework** | Express | `^5.2.1` | HTTP routing with built-in async error delegation |
| **ORM & Data Layer** | Prisma | `^5.22.0` | Type-safe migrations, relations, and JSONB schemas |
| **Database** | PostgreSQL | `16+` | Relational persistence with strict ACID compliance |
| **In-Memory Store** | Redis & ioredis | `^6.0.0` | Sliding window rate limits, OTPs, and token blocklists |
| **Cloud Storage** | `@aws-sdk/client-s3` | `^3.1156.0` | Backblaze B2 / S3 streaming uploads via Busboy |
| **Testing Suite** | Vitest & Supertest | `v5.0.5` | Full suite of unit, integration, flow, and security tests |

---

## 🧩 Key Modules & Capabilities

### 1. Authentication, Sessions & RBAC
- **Token Rotation**: Short-lived JWT access tokens (`15m`) coupled with cryptographically hashed, rotating refresh tokens (`7d`) stored in PostgreSQL for multi-device visibility.
- **Role-Based Access Control**: Strict permissions model segregating `CONSUMER`, `SELLER`, and `ADMIN`.
- **Brute-Force Shield**: Redis-backed sliding window limiter restricting repetitive failed logins.
- **Enterprise Audit Trail**: Tracks entity mutations, administrative approvals, and seller status changes in `AuditLog`.

### 2. S3-Compatible Cloud Storage & Media Streaming
- **Zero Disk Buffering**: Multipart file uploads are piped via `busboy` directly into Backblaze B2 / S3 without touching local disk.
- **Magic-Byte Sniffing**: Inspects initial binary bytes (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `52 49 46 46` for WebP) to prevent spoofed executable uploads.
- **Automatic Lifecycle Cleanup**: Old avatar objects are automatically purged from storage buckets when a user updates their profile picture.
- **CORS & CORP Compliant**: Explicit Helmet Cross-Origin Resource Policy headers allow media streaming across distinct ports and origins without browser isolation blocks.

### 3. Catalog & Dynamic Attribute Architecture
- **Hierarchical Categories**: Self-referencing tree structure supporting unlimited nested subcategories.
- **Dynamic Attribute Configs**: Configurable JSONB specifications (`ram`, `storage`, `color`, `size`) supporting multiselect, range, and boolean filters.
- **SKU-Level Variants**: Distinct pricing, stock allocations, and attributes per variant.

### 4. Marketplace & Moderation Pipeline
- **Seller Onboarding & KYC**: Verification workflow collecting business registrations and bank accounts before authorizing payouts.
- **Multi-Image Product Creator**: Drag-and-drop dropzone supporting up to 5 photos, direct-to-cloud streaming, primary badge toggle, and image reordering.
- **Admin Moderation Queue**: Full-screen photo inspection gallery allowing administrators to inspect all submitted images and reject/approve products before public release.

### 5. Interactive Consumer Storefront & Shopping Flow
- **Buyer Gallery**: Product detail pages feature an interactive thumbnail carousel, hero image switcher, and counter indicator (`1 / 5`).
- **Optimistic Cart & Price Snapshotting**: Quantity mutations resolve optimistically in UI while preserving historical price snapshots against seller pricing fluctuations.
- **Checkout & Payments**: Multi-address address book, coupon discount engine, Cash on Delivery (COD), and sandbox readiness for Nepal payment gateways (eSewa, Khalti).

---

## 🗄️ Database & Domain Modeling

The database schema is managed via **Prisma ORM** ([`Backend/prisma/schema.prisma`](file:///c:/akmart-ecommerce/Backend/prisma/schema.prisma)):

```
┌──────────────┐       ┌────────────────┐       ┌───────────────┐
│     User     ├──────<│  RefreshToken  │       │   AuditLog    │
└──────┬───────┘       └────────────────┘       └───────────────┘
       │
       │ 1:1
       ├───────────────<┌───────────────┐
       │                │ SellerProfile │
       │                └──────┬────────┘
       │                       │ 1:N
       │ 1:N                   ▼
       ├───────────────<┌───────────────┐       ┌────────────────────────┐
       │                │ SellerListing ├──────<│ CategoryAttributeConfig│
       │                └──────┬────────┘       └───────────┬────────────┘
       │ 1:N                   │                            │
       ├───────────────<┌──────▼────────┐       ┌───────────▼───┐
       │                │ProductVariant ├──────<│   Category    │
       │                └──────┬────────┘       └───────┬───────┘
       │                       │                        │
       │ 1:N                   │ 1:N                    │ 1:N
       ├───────────────<┌──────▼────────┐       ┌───────▼───────┐
       │                │ ProductImage  │       │    Product    ├─> Brand
       │                └───────────────┘       └───────────────┘
       │
       ├───────────────< Cart ─────────< CartItem
       ├───────────────< Wishlist ─────< WishlistItem
       ├───────────────< Review ───────< ReviewImage
       └───────────────< Order ────────< OrderItem ───< Address
```

---

## 📡 REST API Directory

All backend endpoints are prefixed with `/api/v1`:

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new consumer account |
| `POST` | `/auth/login` | Public | Authenticate user & issue tokens |
| `POST` | `/auth/verify-account` | Public | Verify account registration OTP |
| `POST` | `/auth/refresh` | Public | Rotate refresh token & obtain access token |
| `POST` | `/auth/logout` | Authenticated | Revoke refresh token & clear cookie |
| `POST` | `/auth/google` | Public | Google OAuth 2.0 exchange |

### 📦 Products & Catalog (`/api/v1/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Search, paginate & filter approved products |
| `GET` | `/products/:slug` | Public | Retrieve full product details & multi-image gallery |
| `POST` | `/products` | Seller / Admin | Create draft product with up to 5 uploaded images |
| `PATCH` | `/products/:id` | Seller / Admin | Update product details or images |
| `DELETE` | `/products/:id` | Admin | Soft-delete product from catalog |

### 🛡️ Admin Moderation (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/products/pending` | Admin | Fetch products awaiting review |
| `PATCH` | `/admin/products/:id/status`| Admin | Approve (`APPROVED`) or Reject (`REJECTED`) product |
| `GET` | `/admin/sellers` | Admin | Inspect vendor KYC and verification submissions |
| `PATCH` | `/admin/sellers/:id/kyc` | Admin | Approve or reject vendor payout capability |

### 🏪 Seller Dashboard (`/api/v1/sellers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/sellers/onboard` | Authenticated | Submit shop profile and verification docs |
| `GET` | `/sellers/listings` | Seller | Fetch vendor's active and draft inventory listings |
| `POST` | `/sellers/listings` | Seller | Attach variant pricing, MRP, and stock offer |
| `GET` | `/sellers/orders` | Seller | Retrieve incoming orders for seller's items |
| `PATCH` | `/sellers/orders/:id/ship` | Seller | Transition fulfillment stepper (`PROCESSING` ➡️ `SHIPPED`) |

### 🛒 Cart & Checkout (`/api/v1/cart`, `/api/v1/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Authenticated | Fetch active user cart with current price alerts |
| `POST` | `/cart/items` | Authenticated | Add listing to cart with price snapshot |
| `PATCH` | `/cart/items/:id` | Authenticated | Update item quantity (optimistic sync) |
| `DELETE` | `/cart/items/:id` | Authenticated | Remove item from cart |
| `POST` | `/orders` | Authenticated | Place order, lock stock, and generate order ID |
| `GET` | `/orders` | Authenticated | Order history and real-time shipping tracker |

### ☁️ Cloud Storage & Media (`/api/v1/uploads`, `/api/v1/files`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/uploads/stream` | Authenticated | Direct multipart stream to Backblaze B2/S3 |
| `POST` | `/uploads/presign` | Authenticated | Request presigned PUT URL for client-side uploads |
| `GET` | `/files/:key(*)` | Public | Stream media assets with cross-origin headers |

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20 or v24 recommended)
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Boot Local Services (PostgreSQL & Redis)
In the repository root:
```bash
docker compose up -d postgres redis
```
Verify containers are running:
```bash
docker compose ps
```

### 3. Backend Setup
```bash
cd Backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Seed database with roles, sample products, and test accounts
npx prisma db seed

# Start development server with hot-reload (tsx)
npm run dev
```
The Backend API will boot at 👉 `http://localhost:5000` (Healthcheck: `http://localhost:5000/health`).

### 4. Frontend Setup
In a new terminal window:
```bash
cd Frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start Vite development server
npm run dev
```
The Storefront interface will launch at 👉 `http://localhost:5173`.

---

## 👤 Default Test Accounts

Initial accounts auto-provisioned by `prisma/seed.ts`:

| Persona | Email | Password | Role / Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@akmart.com` | `Admin@123` | Product inspection queue, KYC approvals, User oversight |
| **Merchant / Vendor** | `seller@techmart.com`| `Seller@123` | Multi-image product creator, SKU listings, Order fulfillment |
| **Standard Consumer** | `consumer@akmart.com`| *(OTP or Login)* | Catalog browsing, Cart, Multi-address checkout, Reviews |

---

## 🧪 Automated Testing & Code Quality

AkMart enforces comprehensive testing across all critical paths:

```bash
cd Backend

# Run the entire 105-test automated Vitest suite
npm test

# Run TypeScript strict type verification (0 errors)
npx tsc -p tsconfig.json --noEmit

# Run ESLint static code analysis
npm run lint
```

In the Frontend:
```bash
cd Frontend

# Verify strict TypeScript typing
npx tsc --noEmit

# Build production bundle with Vite
npm run build
```

### Test Suite Breakdown:
- **`auth.test.ts` & `auth.flow.test.ts`**: Registration, token refresh rotation, and session lifecycle.
- **`storage.unit.test.ts` & `storage.flow.test.ts`**: Magic byte detection, streaming, key generation, and object cleanup.
- **`marketplace.test.ts`**: Complete seller draft ➡️ admin review ➡️ consumer cart lifecycle.
- **`hostile-input.test.ts` & `injection.test.ts`**: SQL parameterization, XSS payloads, and malformed JSON.
- **`bruteForce.test.ts` & `rbac-matrix.test.ts`**: Sliding-window rate limit triggers and role boundary checks.
- **`order.calculation.test.ts` & `coupon.service.test.ts`**: Pricing, tax, and discount accuracy.

---

## 🌐 Production Deployment (Render + Vercel)

The system is architected for zero-downtime deployment:
- **Backend API & PostgreSQL** ➡️ [Render](https://render.com) (Node.js Web Service + Managed PostgreSQL & Redis)
- **Frontend SPA** ➡️ [Vercel](https://vercel.com) (Vite client with `vercel.json` SPA rewrites)
- **Object Storage** ➡️ [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) or AWS S3

👉 **For complete click-by-click instructions, build settings, and secret management, read [DEPLOY.md](DEPLOY.md).**

---

## 🔐 Environment Variables Reference

### Backend (`Backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment mode | `development` / `production` |
| `PORT` | HTTP server port | `5000` |
| `BACKEND_URL` | Public API domain for stream links | `https://your-backend.onrender.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | 32+ char secret for access tokens | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET`| 32+ char secret for refresh tokens| `openssl rand -base64 32` |
| `FRONTEND_WEB_URL` | Web client domain (enforces CORS) | `https://your-frontend.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `*.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-*` |
| `SMTP_HOST` | Mail server host | `smtp.gmail.com` |
| `SMTP_USER` / `PASS`| Email and App Password | `user@gmail.com` |
| `S3_ENDPOINT` | Cloud storage endpoint | `https://s3.us-east-005.backblazeb2.com` |
| `S3_REGION` | Storage bucket region | `us-east-005` |
| `S3_ACCESS_KEY` | B2 Application Key ID | `005ef...` |
| `S3_SECRET_KEY` | B2 Application Key | `K005y...` |
| `S3_BUCKET` | Media bucket name | `akmart-media` |
| `S3_FORCE_PATH_STYLE`| Path style toggle | `false` (B2/S3), `true` (MinIO) |

### Frontend (`Frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint for backend API | `https://your-backend.onrender.com/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth Web Client ID | `*.apps.googleusercontent.com` |

---

## 📄 License

This project is licensed under the **ISC License**.
