import Redis from 'ioredis';
const redis = new Redis('redis://localhost:6379');
async function flush() {
  await redis.flushall();
  console.log('Redis flushed successfully');
  process.exit(0);
}
flush();
