import { server } from './app';
import { env } from './config/env';
import { initBackendSentry } from './lib/sentry';

initBackendSentry();

const PORT = Number(env.PORT) || 5000;

// Global safety net: intercept unhandled promise rejections and uncaught exceptions
// Prevents a single rogue request or library bug from crashing the entire server process.
process.on('unhandledRejection', (reason: any) => {
  console.error('🚨 [Process Safety] Unhandled Promise Rejection intercepted:', reason?.message || reason);
  if (reason?.stack) console.error(reason.stack);
});

process.on('uncaughtException', (err: Error) => {
  console.error('🚨 [Process Safety] Uncaught Exception intercepted:', err.message);
  if (err.stack) console.error(err.stack);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🩺 Health check: http://0.0.0.0:${PORT}/health\n`);
});

