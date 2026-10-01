import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./core/testSetup.js'],
    include: ['features/**/*.test.js'],
    // The judge tests spin up real Docker containers; the matchmaking tests
    // wait through a real 5s countdown. Both are slow by nature, not by bug.
    testTimeout: 30000,
    hookTimeout: 30000,
    // Sequential on purpose: test files share one test database, and the
    // judge's own Docker concurrency limiter is tuned per-host - running
    // suites in parallel would make both a source of flaky failures rather
    // than actually testing anything faster.
    fileParallelism: false,
  },
});
