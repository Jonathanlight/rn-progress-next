import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/geometry.ts', 'src/progress.ts', 'src/optionalSvg.ts'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
