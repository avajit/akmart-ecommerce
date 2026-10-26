# AkMart – Scalable Multi-Vendor E-Commerce Platform

A production-ready, enterprise-grade e-commerce marketplace (inspired by Amazon/Flipkart) designed for the Nepal market. This platform supports multiple sellers, role-based access control, and is built to scale across both Web (React) and Mobile (React Native) applications.

## 🚀 Vision & Architecture
This is not a standard tutorial project. It is architected for real-world deployment on AWS (initially Free Tier) with a strong emphasis on transactional integrity, scalability, and modularity.

- **Frontend:** React (Web), React Native (Mobile - Planned)
- **Backend:** Node.js, Express, TypeScript (Modular Monolith architecture)
- **Database:** PostgreSQL (with Prisma ORM) for strict ACID compliance and JSONB flexibility.
- **Authentication:** JWT with RBAC (Super Admin, Seller, Consumer)
- **Storage:** AWS S3 for product and profile images
- **Payments:** Local Nepalese Gateways (eSewa, Khalti)

## 🧩 Development Modules (Step-by-Step Approach)
To ensure a bug-free and scalable product, development is broken down into strict modules. Each module is fully tested backend-to-frontend before proceeding.

1. **Module 1: Foundation & Auth** (PostgreSQL Setup, Prisma, JWT, RBAC)
2. **Module 2: Product Catalog** (Categories, Brands, Products, JSONB Attributes)
3. **Module 3: Shopping Flow** (Cart, Wishlist, State Management)
4. **Module 4: Orders & Payments** (Checkout, eSewa/Khalti Integration, Order States)
5. **Module 5: Multi-Vendor System** (Seller Dashboards, Inventory Management, Commission)
6. **Module 6: Admin Control** (Super Admin Dashboard, User Management)

## ⚙️ Current Status
- ✅ **Frontend:** React 19, Vite 7, Tailwind CSS, Zustand, React Query with responsive consumer storefront, merchant dashboards, and order tracking.
- ✅ **Backend:** Node.js, Express 5, TypeScript modular monolith with 46 REST API routes, PostgreSQL (Prisma ORM), and Redis caching.

---

## 🖥️ How to Run This Project (Local Development)

### 🎨 Frontend
Inside the `Frontend` folder:
```bash
npm install
npm run dev
```
Site opens at: 👉 http://localhost:5173

### 🗄️ Backend
Inside the `Backend` folder:
```bash
npm install
# Set up database and generate Prisma client:
npx prisma generate
npx prisma migrate dev
# Start the backend server:
npm run dev
```
API runs at: 👉 http://localhost:5000 (Healthcheck: http://localhost:5000/health)

### 🧪 Automated QA & Test Suites
```bash
# Run backend unit tests:
cd Backend && npx vitest run ../tests/unit

# Run storage unit & integration suites:
cd Backend && npx vitest run src/tests/unit/storage.unit.test.ts src/tests/integration/storage.flow.test.ts

# Run automated smoke suite (< 30 seconds):
cd Backend && npx vitest run ../tests/api/smoke.test.ts
```

### 📦 S3-Compatible Storage (MinIO in Dev, AWS S3/R2 in Prod)
AkMart uses an industry-standard, reusable direct-upload storage architecture.

1. **Start MinIO via Docker Compose**:
```bash
docker compose up -d minio minio-init
```
2. **Default Local Credentials**:
- **API Endpoint:** `http://localhost:9000`
- **Web Console:** `http://localhost:9001`
- **Access Key:** `minioadmin`
- **Secret Key:** `minioadmin`
- **Default Bucket:** `akmart-media` (auto-provisioned by `minio-init`)

For full API documentation, code examples, and instructions on switching to AWS S3/Cloudflare R2, see [docs/STORAGE.md](docs/STORAGE.md).

# Run Playwright E2E suites:
npx playwright test tests/e2e
```
