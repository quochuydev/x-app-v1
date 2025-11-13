import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'drizzle/**',
        '**/*.config.ts',
        '**/*.spec.ts',
        '**/*.fixture.ts',
      ],
    },
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/results.html',
    },
    reporters: process.env.CI ? ['verbose', 'json', 'html'] : ['verbose'],
  },
})
