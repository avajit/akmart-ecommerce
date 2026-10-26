import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimiter';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { setupGracefulShutdown } from './utils/gracefulShutdown';
import { createServer } from 'http';

// Initialize Core Services
export const prisma = new PrismaClient();
export const redis = new Redis(env.REDIS_URL);

const app = express();
const server = createServer(app);

// Enable trust proxy so Express recognizes real client IPs behind Render/Cloudflare/load balancers
app.set('trust proxy', 1);

// Graceful Shutdown setup
setupGracefulShutdown(server, prisma, redis);

// --- GLOBAL MIDDLEWARES ---

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS (Strict allowed origins for web & mobile, plus Vercel deployment support)
export const allowedOrigins = [
  env.FRONTEND_WEB_URL?.replace(/\/$/, ''),
  env.FRONTEND_MOBILE_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      const isVercel = cleanOrigin.endsWith('.vercel.app');
      const isAllowed = allowedOrigins.includes(cleanOrigin) || isVercel;
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    credentials: true, // Required for HttpOnly cookies (Refresh Token)
  })
);

// 3. Body Parsers (with size limits to prevent DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 4. Rate Limiting (Global DDoS protection via Redis)
app.use(globalLimiter);

// --- ROUTES ---
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import sellerRoutes from './routes/seller.routes';
import adminRoutes from './routes/admin.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import orderRoutes from './routes/order.routes';
import couponRoutes from './routes/coupon.routes';
import uploadRoutes from './routes/upload.routes';
import { streamFile } from './controllers/upload.controller';

// Health Check Endpoint (For orchestrators/load balancers)
app.get('/health', async (req, res) => {
  try {
    // Check DB and Redis connectivity
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.status(200).json({ status: 'ok', message: 'All systems operational' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', message: 'Service unavailable' });
  }
});

// Register API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/uploads', uploadRoutes);

// Dedicated File Streaming Endpoints
app.get('/api/v1/files/{*key}', streamFile);
app.get('/api/files/{*key}', streamFile);

// --- ERROR HANDLING ---

// Catch-all unhandled route handler
app.use((req, res, _next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 404,
      message: `Cannot find ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

export { app, server };
