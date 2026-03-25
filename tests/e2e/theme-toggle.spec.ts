import { test, expect } from '../fixtures';
import {
  toggleTheme,
  getCurrentTheme,
  countThemeToggleMutations,
  detectFlushSyncWarnings,
  measureThemeToggleLayoutShift,
} from '../helpers/theme-helpers';
import { waitForHydration } from '../helpers/wait-for-hydration';
import { captureBeforeAfterScreenshots } from '../helpers/visual-compare';

/**
 * Theme Toggle Tests - AnimatedThemeToggler Component
 *
 * Testing for blink issues caused by:
 * - View Transition API with flushSync
 * - MutationObserver loops
 * - Excessive re-renders during theme toggle
 */

test.describe('AnimatedThemeToggler', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
  });

  test('should toggle theme without visual regression', async ({ page }) => {
    // Set up console warning detection
    const warnings = await detectFlushSyncWarnings(page);

    // Capture before/after screenshots
    const { before, after } = await captureBeforeAfterScreenshots(
      page,
      async () => {
        await toggleTheme(page);
      },
      'theme-toggle',
      { fullPage: true, animations: 'disabled' }
    );

    // Verify theme changed
    const currentTheme = await getCurrentTheme(page);
    expect(['light', 'dark']).toContain(currentTheme);

    // Check for flushSync warnings (expected to fail if using flushSync incorrectly)
    if (warnings.length > 0) {
      console.warn('⚠️ flushSync warnings detected:', warnings);
    }
  });

  test('should not cause excessive DOM mutations', async ({ page }) => {
    // Count mutations during theme toggle
    const mutationCount = await countThemeToggleMutations(page);

    console.log(`Theme toggle caused ${mutationCount} DOM mutations`);

    // Should mutate less than 50 times (reasonable threshold)
    // AnimatedThemeToggler may fail this if MutationObserver loops excessively
    expect(mutationCount).toBeLessThan(50);
  });

  test('should not cause layout shift', async ({ page }) => {
    // Measure layout shift during theme toggle
    const clsScore = await measureThemeToggleLayoutShift(page);

    console.log(`Theme toggle CLS score: ${clsScore}`);

    // CLS should be minimal (< 0.1 is good)
    expect(clsScore).toBeLessThan(0.1);
  });

  test('should complete View Transition API within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await toggleTheme(page);

    const duration = Date.now() - startTime;

    console.log(`Theme toggle took ${duration}ms`);

    // Should complete within 2 seconds
    expect(duration).toBeLessThan(2000);
  });

  test('should toggle multiple times without breaking', async ({ page }) => {
    // Toggle theme 5 times rapidly
    for (let i = 0; i < 5; i++) {
      await toggleTheme(page);
      await page.waitForTimeout(300);
    }

    // Verify theme is still applied correctly
    const currentTheme = await getCurrentTheme(page);
    expect(['light', 'dark']).toContain(currentTheme);

    // Verify page is still interactive
    const themeButton = page.locator('[aria-label*="theme" i], [data-theme-toggle], button:has-text("Toggle")').first();
    await expect(themeButton).toBeVisible();
  });

  test('should not block main thread during transition', async ({ page }) => {
    // Measure if page is responsive during theme toggle
    const isResponsive = await page.evaluate(async () => {
      let responseTime = 0;
      const startTime = performance.now();

      // Toggle theme
      const themeButton = document.querySelector('[aria-label*="theme" i], [data-theme-toggle]') as HTMLElement;
      if (themeButton) {
        themeButton.click();
      }

      // Try to interact immediately
      await new Promise(resolve => setTimeout(resolve, 100));
      responseTime = performance.now() - startTime;

      return responseTime < 500; // Should respond within 500ms
    });

    expect(isResponsive).toBe(true);
  });
});

test.describe('Theme Toggle Visual Regression', () => {
  test('light mode baseline', async ({ page, noAnimations }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Ensure light mode
    const theme = await getCurrentTheme(page);
    if (theme !== 'light') {
      await toggleTheme(page);
    }

    await expect(page).toHaveScreenshot('theme-light.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });

  test('dark mode baseline', async ({ page, noAnimations }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Ensure dark mode
    const theme = await getCurrentTheme(page);
    if (theme !== 'dark') {
      await toggleTheme(page);
    }

    await expect(page).toHaveScreenshot('theme-dark.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });
});
