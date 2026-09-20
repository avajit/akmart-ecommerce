import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { Server } from 'http';

export const setupGracefulShutdown = (server: Server, prisma: PrismaClient, redis: Redis) => {
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

    try {
      // 1. Stop accepting new HTTP requests
      server.close(() => {
        console.log('HTTP server closed.');
      });

      // 2. Close Prisma connections
      await prisma.$disconnect();
      console.log('Prisma disconnected.');

      // 3. Close Redis connections
      redis.disconnect();
      console.log('Redis disconnected.');

      console.log('✅ Graceful shutdown completed.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during graceful shutdown:', err);
      process.exit(1);
    }
  };

  // Listen for termination signals (PM2 sends SIGINT/SIGTERM)
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
