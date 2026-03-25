import { test, expect } from '../fixtures';
import {
  waitForHydration,
  detectHydrationMismatch,
  measureLayoutShift,
  waitForThemeProvider,
  findSuppressedHydrationElements,
} from '../helpers/wait-for-hydration';

/**
 * Hydration Tests
 *
 * Testing for:
 * - React 19 hydration errors
 * - Theme provider hydration
 * - suppressHydrationWarning usage
 * - Layout shifts during hydration
 */

test.describe('React Hydration', () => {
  test('should hydrate without errors', async ({ page }) => {
    const errors = await detectHydrationMismatch(page);

    await page.goto('/');
    await waitForHydration(page);

    // Check for hydration errors
    if (errors.length > 0) {
      console.error('❌ Hydration errors detected:', errors);
    }

    expect(errors.length).toBe(0);
  });

  test('should have minimal layout shift during hydration', async ({ page }) => {
    await page.goto('/');

    const clsScore = await measureLayoutShift(page);

    console.log(`Hydration CLS score: ${clsScore}`);

    // CLS should be less than 0.1 (good)
    expect(clsScore).toBeLessThan(0.1);
  });

  test('should hydrate within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await waitForHydration(page);

    const duration = Date.now() - startTime;

    console.log(`Hydration took ${duration}ms`);

    // Should hydrate within 5 seconds
    expect(duration).toBeLessThan(5000);
  });
});

test.describe('Theme Provider Hydration', () => {
  test('should initialize theme without flash', async ({ page }) => {
    await page.goto('/');

    // Check if theme is set immediately
    const hasInitialTheme = await page.evaluate(() => {
      const html = document.documentElement;
      return html.classList.contains('light') || html.classList.contains('dark');
    });

    expect(hasInitialTheme).toBe(true);

    // Wait for full hydration
    await waitForHydration(page);

    // Verify theme is still set
    const hasTheme = await page.evaluate(() => {
      const html = document.documentElement;
      return html.classList.contains('light') || html.classList.contains('dark');
    });

    expect(hasTheme).toBe(true);
  });

  test('should not flash wrong theme on load', async ({ page }) => {
    // Set theme to dark in localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });

    await page.goto('/');

    // Check theme immediately
    const initialTheme = await page.evaluate(() => {
      const html = document.documentElement;
      return html.classList.contains('dark') ? 'dark' : 'light';
    });

    console.log(`Initial theme: ${initialTheme}`);

    // Should be dark (no flash)
    expect(initialTheme).toBe('dark');

    await waitForHydration(page);

    // Should still be dark
    const finalTheme = await page.evaluate(() => {
      const html = document.documentElement;
      return html.classList.contains('dark') ? 'dark' : 'light';
    });

    expect(finalTheme).toBe('dark');
  });

  test('should sync theme provider before hydration', async ({ page }) => {
    await page.goto('/');

    // Check if theme is set in blocking script
    const hasBlockingScript = await page.evaluate(() => {
      // next-themes injects a blocking script to prevent FOUC
      const scripts = document.querySelectorAll('script');
      return Array.from(scripts).some(script =>
        script.textContent?.includes('theme') ||
        script.textContent?.includes('dark') ||
        script.textContent?.includes('light')
      );
    });

    console.log(`Has blocking theme script: ${hasBlockingScript}`);

    await waitForHydration(page);

    // Theme provider should be ready
    await waitForThemeProvider(page);

    const themeProviderReady = await page.evaluate(() => {
      const html = document.documentElement;
      return html.classList.contains('light') || html.classList.contains('dark');
    });

    expect(themeProviderReady).toBe(true);
  });
});

test.describe('suppressHydrationWarning Usage', () => {
  test('should document suppressHydrationWarning elements', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const suppressedElements = await findSuppressedHydrationElements(page);

    if (suppressedElements.length > 0) {
      console.log('ℹ️ Elements with suppressHydrationWarning:', suppressedElements);
    }

    // Just documenting, not failing
    expect(Array.isArray(suppressedElements)).toBe(true);
  });

  test('should only suppress hydration on html/body for theme', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const suppressedElements = await findSuppressedHydrationElements(page);

    // Filter out acceptable suppressions (html/body for theme)
    const unexpectedSuppressions = suppressedElements.filter(
      el => !el.startsWith('html') && !el.startsWith('body')
    );

    if (unexpectedSuppressions.length > 0) {
      console.warn('⚠️ Unexpected suppressHydrationWarning usage:', unexpectedSuppressions);
    }

    // Should only suppress on html/body
    expect(unexpectedSuppressions.length).toBe(0);
  });
});

test.describe('Font Loading', () => {
  test('should load fonts before hydration completes', async ({ page }) => {
    await page.goto('/');

    // Check if fonts are loaded
    const fontsReady = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.status === 'loaded';
    });

    expect(fontsReady).toBe(true);

    await waitForHydration(page);
  });

  test('should have DM Sans font loaded', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const hasDMSans = await page.evaluate(async () => {
      await document.fonts.ready;

      // Check if DM Sans is loaded
      for (const font of document.fonts) {
        if (font.family.includes('DM Sans')) {
          return font.status === 'loaded';
        }
      }

      return false;
    });

    console.log(`DM Sans loaded: ${hasDMSans}`);

    expect(hasDMSans).toBe(true);
  });
});
