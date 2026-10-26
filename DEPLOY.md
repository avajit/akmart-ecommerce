# 🚀 AkMart Full-Stack Deployment Guide (Render + Vercel)

This guide walks you through deploying the **AkMart Full-Stack Platform**:
- **Backend (Node.js + Express 5 + Prisma)** ➡️ **Render**
- **Frontend (React 19 + Vite)** ➡️ **Vercel**
- **Database (PostgreSQL)** ➡️ **Render PostgreSQL / Supabase / Neon**
- **Redis (Cache & Rate Limiting)** ➡️ **Render Redis / Upstash**
- **Object Storage (Images & Media)** ➡️ **Backblaze B2 / AWS S3**

---

## 📋 Architecture & Connection Map

```
┌─────────────────────────────────┐
│     Vercel (React Frontend)     │
│   https://akmart-app.vercel.app │
└────────────────┬────────────────┘
                 │
                 │ 1. API Requests (VITE_API_URL)
                 │ 2. CORS Allow (FRONTEND_WEB_URL)
                 ▼
┌─────────────────────────────────┐
│    Render (Express Backend)     │
│  https://akmart-api.onrender.com│
└──────┬──────────┬──────────┬────┘
       │          │          │
       ▼          ▼          ▼
 ┌──────────┐┌─────────┐┌──────────────┐
 │PostgreSQL││  Redis  ││Backblaze B2  │
 │ (Prisma) ││(Limiter)││(Media Stream)│
 └──────────┘└─────────┘└──────────────┘
```

---

## Part 1: Deploying the Backend on Render

### Step 1.1: Create Managed PostgreSQL & Redis
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** ➡️ **PostgreSQL**:
   - **Name**: `akmart-postgres`
   - **Plan**: Free (or Starter)
   - Once created, copy the **Internal Database URL** (or External if connecting from outside Render).
3. Click **New +** ➡️ **Redis**:
   - **Name**: `akmart-redis`
   - **Plan**: Free
   - Copy the **Internal Redis URL** (`redis://...`).

---

### Step 1.2: Create the Backend Web Service
1. In Render, click **New +** ➡️ **Web Service**.
2. Connect your GitHub repository (`akmart-ecommerce`).
3. Fill in the service configuration:
   - **Name**: `akmart-backend`
   - **Language**: `Node`
   - **Root Directory**: `Backend`  *(Important!)*
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     sh ./start.sh
     ```
     *(Note: `start.sh` automatically runs `npx prisma migrate deploy` and `npx prisma db seed` to initialize roles and default users, then boots `node dist/server.js`)*
   - **Instance Type**: Free (or Starter)

---

### Step 1.3: How to Add Backend Credentials in Render
1. In your Web Service page on Render, click on the **Environment** tab in the left sidebar.
2. You can either:
   - **Option A (Bulk Add)**: Click **Add from .env** and paste your variables directly.
   - **Option B (One by One)**: Click **Add Environment Variable** for each key below.

#### Required Backend Environment Variables in Render:

| Key | Example / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `BACKEND_URL` | `https://akmart-backend.onrender.com` *(your Render service URL)* |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/akmart_db?sslmode=require` |
| `REDIS_URL` | `redis://default:pass@host:6379` |
| `JWT_ACCESS_SECRET` | 32+ character random string (run `openssl rand -base64 32`) |
| `JWT_REFRESH_SECRET` | 32+ character random string |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `BCRYPT_SALT_ROUNDS` | `12` |
| `DEFAULT_USER_ROLE` | `CONSUMER` |
| `FRONTEND_WEB_URL` | `https://your-frontend.vercel.app` *(set after Vercel deploy)* |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | `https://akmart-backend.onrender.com/api/v1/auth/google/callback` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email address |
| `SMTP_PASS` | 16-digit Google App Password |
| `SMTP_FROM` | `"AKMart" <your_email@gmail.com>` |
| `S3_ENDPOINT` | `https://s3.us-east-005.backblazeb2.com` |
| `S3_REGION` | `us-east-005` |
| `S3_ACCESS_KEY` | Backblaze Application Key ID (`005ef36...`) |
| `S3_SECRET_KEY` | Backblaze Application Key (`K005y...`) |
| `S3_BUCKET` | Backblaze Bucket Name (`akmart-media-avajit`) |
| `S3_FORCE_PATH_STYLE` | `false` |
| `MAX_IMAGE_SIZE_MB` | `5` |

3. Click **Save Changes**. Render will automatically trigger a build and deployment.

---

## Part 2: Deploying the Frontend on Vercel

### Step 2.1: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** ➡️ **Project**.
3. Import your GitHub repository (`akmart-ecommerce`).
4. Configure the Project Settings:
   - **Project Name**: `akmart-ecommerce` (or any custom name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `Frontend` *(Critical!)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

*(Note: SPA client-side routes like `/cart`, `/product/:slug`, `/seller/dashboard` are already handled by [`Frontend/vercel.json`](file:///c:/akmart-ecommerce/Frontend/vercel.json) rewrites)*

---

### Step 2.2: How to Add Frontend Credentials in Vercel
1. While still on the import page (or in **Project Settings** ➡️ **Environment Variables**):
2. Add the following two variables:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://akmart-backend.onrender.com/api/v1` | Points to your live Render backend API |
| `VITE_GOOGLE_CLIENT_ID` | `5660915...apps.googleusercontent.com` | Public Google OAuth client ID |

3. Check all environments: **Production**, **Preview**, and **Development**.
4. Click **Deploy**.

---

## Part 3: Connecting the Two (CORS & Google OAuth)

Once both are deployed, perform the 2-minute handshake:

### 1. Update Render's `FRONTEND_WEB_URL`
- In Render Dashboard ➡️ `akmart-backend` ➡️ **Environment**:
- Update `FRONTEND_WEB_URL` to your live Vercel domain:
  ```
  FRONTEND_WEB_URL = https://akmart-ecommerce.vercel.app
  ```
- Click **Save Changes** (Render will reload without rebuilding).

### 2. Update Google Cloud Console
- Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
- Edit your OAuth 2.0 Web Client:
  - **Authorized JavaScript origins**:
    - `https://your-frontend.vercel.app`
  - **Authorized redirect URIs**:
    - `https://your-backend.onrender.com/api/v1/auth/google/callback`
- Click **Save**.

---

## Part 4: Verification Checklist

1. **Backend Health Check**:
   Visit `https://your-backend.onrender.com/health` ➡️ Should return `{"status":"ok"}`.
2. **Catalog & Images**:
   Visit your Vercel URL. Products, thumbnails, and images uploaded to Backblaze B2 should load with zero CORS or CORP errors.
3. **Authentication & Profile Avatar**:
   Sign in or register. Go to `/profile` and upload an avatar image. Verify the avatar replaces cleanly and syncs to the navbar.
4. **Seller Multi-Image Product Creation**:
   Log in as seller (`seller@techmart.com` / `Seller@123`). Navigate to Create Product, drop 5 images, mark one as primary, and submit for review.
