/// <reference types="./tests/types/window" />
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Next.js portfolio testing
 * Focus: Debugging screen blink issues (AnimatedThemeToggler, Card3D RAF, Dock, MorphingDialog)
 */
export default defineConfig({
  testDir: './tests',

  // Timeout configuration - motion-heavy components need longer waits
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for expect assertions
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail fast on CI
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    // Base URL for the app
    baseURL: 'http://localhost:3000',

    // Trace configuration - capture on first retry for debugging
    trace: 'on-first-retry',

    // Screenshot configuration
    screenshot: 'only-on-failure',

    // Video recording - retain on failure to see blinks in slow motion
    video: 'retain-on-failure',

    // Reduce motion to prevent test flakiness
    reducedMotion: 'reduce',

    // Strict mode for better element selection
    strictSelectors: true,

    // Action timeout
    actionTimeout: 10 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Test projects - test both themes and mobile/desktop
  projects: [
    {
      name: 'chromium-light',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'light',
      },
    },
    {
      name: 'chromium-dark',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  // Auto-start Next.js dev server
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
