import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { env } from '../config/env';

// Initialize Redis client
const redisClient = new Redis(env.REDIS_URL);

redisClient.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

// Global Rate Limiter: Protects against basic DDoS
export const globalLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: {
      code: 429,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});

// Auth Rate Limiter: Stricter limits for login/register endpoints to prevent brute-force
export const authLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test' && !process.env.ENABLE_RATE_LIMIT_TEST,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.',
    error: {
      code: 429,
      errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts from this IP, please try again later.',
    },
  },
});
