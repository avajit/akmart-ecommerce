import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'], // Will run before tests to clean DB
    fileParallelism: false, // Prevents parallel DB wipes across different test files
    poolOptions: {
      threads: {
        singleThread: true, // Prevent DB race conditions during tests
      }
    }
  },
});
