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
    // @ts-expect-error — rate-limit-redis sendCommand types don't match ioredis.call signature
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:global:',
  }),
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 5000 : env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
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

// Auth Rate Limiter: IP-based limits for login/register endpoints to prevent rapid IP flooding
export const authLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error — rate-limit-redis sendCommand types don't match ioredis.call signature
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:auth:',
  }),
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 100 : env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  skipSuccessfulRequests: true, // Crucial: Successful logins/verifications do not count towards brute-force limits
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
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

// Account Rate Limiter: Per-account protection against distributed botnet credential stuffing
export const accountLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error — rate-limit-redis sendCommand types don't match ioredis.call signature
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:account:',
  }),
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 100 : env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const identifier = req.body?.email || req.body?.phoneNumber || req.body?.identifier;
    return identifier && typeof identifier === 'string'
      ? `account:${identifier.trim().toLowerCase()}`
      : req.ip || '127.0.0.1';
  },
  validate: false,
  skip: () => env.NODE_ENV === 'test' && !process.env.ENABLE_RATE_LIMIT_TEST,
  message: {
    success: false,
    message: 'Too many authentication attempts for this account, please try again later.',
    error: {
      code: 429,
      errorCode: 'ACCOUNT_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts for this account, please try again later.',
    },
  },
});

// Cancel Registration Limiter: Prevents enumeration / DB flooding
export const cancelRegistrationLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error — rate-limit-redis sendCommand types don't match ioredis.call signature
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:cancel:',
  }),
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 50 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many cancellation requests from this IP, please try again later.',
    error: {
      code: 429,
      errorCode: 'TOO_MANY_REQUESTS',
      message: 'Too many cancellation requests from this IP, please try again later.',
    },
  },
});

// Upload Rate Limiter: Protects presign & direct upload endpoints from abuse
export const uploadLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error — rate-limit-redis sendCommand types don't match ioredis.call signature
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:upload:',
  }),
  windowMs: 60 * 1000,
  max: env.NODE_ENV === 'development' ? 100 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many upload requests, please try again later.',
    error: {
      code: 429,
      errorCode: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many upload requests, please try again later.',
    },
  },
});
