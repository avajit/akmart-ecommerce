# 🛍️ AkMart Frontend Storefront & Portals

The client application for the **AkMart Multi-Vendor E-Commerce Platform**, built with **React 19**, **Vite 7**, **Tailwind CSS**, and **Zustand**.

---

## 🚀 Key Features

- **Consumer Storefront**: Catalog browsing, multi-attribute filtering, instant search, responsive cart drawer, and multi-address checkout.
- **Interactive Multi-Image Product Gallery**: Active hero preview, counter indicator (`1 / 5`), and thumbnail carousel with cart snapshot retention.
- **Seller Portal**: Merchant onboarding, multi-image product creator with drag-and-drop cloud streaming to Backblaze B2, SKU variant management, and order fulfillment.
- **Admin Moderation Dashboard**: Full-screen photo inspection gallery for product review, seller KYC approvals, and category management.
- **Client-Side SPA Routing**: Fully configured for Vercel with [`vercel.json`](vercel.json) rewrites.

---

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Key | Description | Local Value | Production (Vercel) |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Backend REST API endpoint | `http://localhost:5000/api/v1` | `https://your-backend.onrender.com/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-google-client-id` | `your-google-client-id` |

### 3. Start Development Server
```bash
npm run dev
```
Access the application at 👉 `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in `dist/` with code splitting and zero TypeScript errors.

---

## 📁 Architecture & Directory Structure

```
Frontend/
├── public/                 # Static public assets
├── src/
│   ├── api/                # Axios client with token rotation & API services
│   ├── assets/             # Brand logos and iconography
│   ├── components/         # Reusable UI components & MultiImageUploader
│   │   ├── common/         # Buttons, Inputs, Titles, Image Uploaders
│   │   └── layout/         # Navbar, Footer, Sidebar
│   ├── pages/              # Routed pages
│   │   ├── admin/          # ProductReview, Sellers, Admin Products
│   │   ├── seller/         # CreateProduct, Listings, Seller Dashboard
│   │   ├── Cart.tsx        # Shopping Cart with optimistic sync
│   │   ├── Checkout.tsx    # Multi-step checkout & payment
│   │   ├── Home.tsx        # Hero banner & trending collections
│   │   ├── Product.tsx     # Product details & interactive gallery
│   │   └── Profile.tsx     # User profile & avatar cloud upload
│   ├── stores/             # Zustand stores (authStore, cartStore, toastStore)
│   ├── types/              # TypeScript interface definitions
│   └── utils/              # Helper utilities and session storage guards
├── vercel.json             # Vercel SPA routing rewrites
└── vite.config.js          # Vite configuration & plugins
```
