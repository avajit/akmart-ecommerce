import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    fileParallelism: false,
    include: ['src/**/*.test.ts', '../tests/**/*.test.ts'],
    exclude: ['dist', 'node_modules', '../tests/ui/**', '../tests/e2e/**'],
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/tests/**',
        'src/server.ts',
        'src/**/*.d.ts',
      ],
      thresholds: {
        statements: 35,
        branches: 20,
        functions: 30,
        lines: 35,
      },
    },
  },
});
