import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { env } from '../config/env';

// Mock Google SSO library globally
vi.mock('google-auth-library', () => {
  return {
    OAuth2Client: vi.fn().mockImplementation(() => {
      return {
        getTokenInfo: vi.fn().mockResolvedValue({
          email: 'test-google@example.com',
          sub: 'google-sub-123',
        }),
      };
    }),
  };
});

export const prismaTest = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
});

export const redisTest = new Redis(env.REDIS_URL);

beforeAll(async () => {
  // Ensure we are definitely connected to the test DB
  if (!env.DATABASE_URL.includes('test')) {
    throw new Error('FATAL: Attempting to run tests against a non-test database! Aborting.');
  }

  // Ensure essential test data like Roles/Permissions exist
  await prismaTest.role.upsert({
    where: { name: 'CONSUMER' },
    update: {},
    create: { name: 'CONSUMER', description: 'Standard user' }
  });
});

beforeEach(async () => {
  // Clean dynamic tables before every test in referential order
  await prismaTest.orderItem.deleteMany();
  await prismaTest.order.deleteMany();
  await prismaTest.address.deleteMany();
  await prismaTest.contactMessage.deleteMany();
  await prismaTest.reviewImage.deleteMany();
  await prismaTest.review.deleteMany();
  await prismaTest.cartItem.deleteMany();
  await prismaTest.cart.deleteMany();
  await prismaTest.sellerListing.deleteMany();
  await prismaTest.productVariant.deleteMany();
  await prismaTest.product.deleteMany();
  await prismaTest.sellerProfile.deleteMany();
  await prismaTest.refreshToken.deleteMany();
  await prismaTest.user.deleteMany();
  await redisTest.flushall();
});

afterAll(async () => {
  await prismaTest.$disconnect();
  redisTest.disconnect();
  try {
    const { prisma, redis } = await import('../app');
    await prisma.$disconnect();
    redis.disconnect();
  } catch {
    // Ignore if not instantiated
  }
});
