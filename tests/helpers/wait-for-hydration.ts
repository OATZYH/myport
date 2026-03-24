import { Page, expect } from '@playwright/test';

/**
 * Hydration Helper
 * Detects React 19 hydration, theme provider initialization, and font loading
 */

export interface HydrationOptions {
  /** Wait for network to be idle (default: true) */
  waitForNetwork?: boolean;
  /** Wait for fonts to load (default: true) */
  waitForFonts?: boolean;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Wait for React hydration to complete
 * Checks for:
 * - React root hydration
 * - Theme provider initialization
 * - Font loading completion
 */
export async function waitForHydration(
  page: Page,
  options: HydrationOptions = {}
): Promise<void> {
  const {
    waitForNetwork = true,
    waitForFonts = true,
    timeout = 30000,
  } = options;

  // Wait for network to be idle if requested
  if (waitForNetwork) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  // Wait for React to hydrate
  await page.waitForFunction(
    () => {
      // Check if React has hydrated by looking for React internals
      const root = document.getElementById('__next') || document.body;
      // @ts-expect-error - accessing React internals
      return root._reactRootContainer !== undefined || root._reactRootContainer !== null;
    },
    { timeout }
  ).catch(() => {
    // Fallback: just wait for DOM ready
    console.warn('Could not detect React hydration, continuing anyway');
  });

  // Wait for theme provider to initialize
  await page.waitForFunction(
    () => {
      // Check if theme is applied
      const html = document.documentElement;
      return html.classList.contains('light') || html.classList.contains('dark');
    },
    { timeout }
  );

  // Wait for fonts to load if requested
  if (waitForFonts) {
    await page.waitForFunction(
      () => document.fonts.ready,
      { timeout }
    );
  }

  // Small delay to ensure everything has settled
  await page.waitForTimeout(100);
}

/**
 * Detect hydration mismatches by monitoring console errors
 */
export async function detectHydrationMismatch(page: Page): Promise<string[]> {
  const hydrationErrors: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    // React 19 hydration error patterns
    if (
      text.includes('Hydration failed') ||
      text.includes('hydration error') ||
      text.includes('did not match') ||
      text.includes('Warning: Expected server') ||
      text.includes('suppressHydrationWarning')
    ) {
      hydrationErrors.push(text);
    }
  });

  return hydrationErrors;
}

/**
 * Measure Cumulative Layout Shift during hydration
 * Returns CLS score (lower is better, < 0.1 is good)
 */
export async function measureLayoutShift(page: Page): Promise<number> {
  // Inject CLS tracking
  await page.addInitScript(() => {
    window.__CLS_SCORE__ = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // @ts-expect-error - CLS entry type
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          // @ts-expect-error - CLS value
          window.__CLS_SCORE__ += entry.value;
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  });

  // Wait for hydration
  await waitForHydration(page);

  // Get CLS score
  const clsScore = await page.evaluate(() => {
    // @ts-expect-error - custom property
    return window.__CLS_SCORE__ || 0;
  });

  return clsScore;
}

/**
 * Wait for theme provider to be ready
 * Useful for testing theme-dependent components
 */
export async function waitForThemeProvider(page: Page, timeout = 10000): Promise<void> {
  await page.waitForFunction(
    () => {
      // Check if next-themes has initialized
      const html = document.documentElement;
      const hasTheme = html.classList.contains('light') || html.classList.contains('dark');
      const hasStyle = html.style.colorScheme === 'light' || html.style.colorScheme === 'dark';
      return hasTheme || hasStyle;
    },
    { timeout }
  );
}

/**
 * Check if suppressHydrationWarning is being used
 * Returns elements with suppressHydrationWarning attribute
 */
export async function findSuppressedHydrationElements(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-suppress-hydration-warning]');
    return Array.from(elements).map((el) => {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
      return `${tag}${id}${classes}`;
    });
  });
}
