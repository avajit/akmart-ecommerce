import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { env } from '../config/env';

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
  const consumerRole = await prismaTest.role.upsert({
    where: { name: 'CONSUMER' },
    update: {},
    create: { name: 'CONSUMER', description: 'Standard user' }
  });
});

beforeEach(async () => {
  // Clean dynamic tables before every test
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
});
