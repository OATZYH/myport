import { Page, expect } from '@playwright/test';

/**
 * Theme Helper
 * Utilities for testing theme switching and dark mode
 */

export type Theme = 'light' | 'dark';

/**
 * Get current theme from DOM
 */
export async function getCurrentTheme(page: Page): Promise<Theme> {
  const theme = await page.evaluate(() => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) return 'dark';
    if (html.classList.contains('light')) return 'light';
    // Fallback to style attribute
    if (html.style.colorScheme === 'dark') return 'dark';
    return 'light';
  });
  return theme;
}

/**
 * Toggle theme by clicking the theme toggle button
 * Waits for View Transition API to complete
 */
export async function toggleTheme(page: Page, waitForTransition = true): Promise<void> {
  const beforeTheme = await getCurrentTheme(page);

  // Find and click theme toggle button
  // The AnimatedThemeToggler renders a button with theme icons
  const themeButton = page.locator('[aria-label*="theme" i], [data-theme-toggle], button:has-text("Toggle")').first();

  await themeButton.click();

  if (waitForTransition) {
    // Wait for View Transition API to complete
    await page.waitForFunction(
      () => {
        // @ts-expect-error - View Transitions API
        return !document.startViewTransition || !document.activeViewTransition;
      },
      { timeout: 5000 }
    ).catch(() => {
      // View Transitions not supported or already complete
    });

    // Wait for theme to actually change
    await page.waitForFunction(
      (before) => {
        const html = document.documentElement;
        const current = html.classList.contains('dark') ? 'dark' : 'light';
        return current !== before;
      },
      beforeTheme,
      { timeout: 5000 }
    );
  }

  // Small delay for animations to settle
  await page.waitForTimeout(300);
}

/**
 * Set theme directly without animations
 * Useful for setting up test state
 */
export async function setThemeWithoutAnimation(page: Page, theme: Theme): Promise<void> {
  await page.evaluate((targetTheme) => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(targetTheme);
    html.style.colorScheme = targetTheme;

    // Update localStorage to persist
    localStorage.setItem('theme', targetTheme);
  }, theme);

  // Wait for theme to apply
  await page.waitForTimeout(100);
}

/**
 * Count View Transition API mutations during theme toggle
 * Returns number of DOM mutations that occurred
 */
export async function countThemeToggleMutations(page: Page): Promise<number> {
  // Set up mutation observer before toggling
  const mutationCountPromise = page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let count = 0;
      const observer = new MutationObserver((mutations) => {
        count += mutations.length;
      });

      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      // Stop observing after 2 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(count);
      }, 2000);
    });
  });

  // Toggle theme
  await toggleTheme(page, false);

  // Get mutation count
  return await mutationCountPromise;
}

/**
 * Check for flushSync warnings in console
 * React warns when flushSync is used incorrectly
 */
export async function detectFlushSyncWarnings(page: Page): Promise<string[]> {
  const warnings: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (
      text.includes('flushSync') ||
      text.includes('ReactDOM.flushSync')
    ) {
      warnings.push(text);
    }
  });

  return warnings;
}

/**
 * Verify theme toggle doesn't cause layout shift
 * Returns CLS score during toggle
 */
export async function measureThemeToggleLayoutShift(page: Page): Promise<number> {
  // Inject CLS tracking
  await page.addInitScript(() => {
    window.__THEME_CLS__ = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // @ts-expect-error - CLS entry
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          // @ts-expect-error - CLS value
          window.__THEME_CLS__ += entry.value;
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  });

  // Get initial CLS
  const initialCLS = await page.evaluate(() => {
    // @ts-expect-error - custom property
    return window.__THEME_CLS__ || 0;
  });

  // Toggle theme
  await toggleTheme(page);

  // Get final CLS
  const finalCLS = await page.evaluate(() => {
    // @ts-expect-error - custom property
    return window.__THEME_CLS__ || 0;
  });

  return finalCLS - initialCLS;
}

/**
 * Wait for theme colors to apply
 * Checks if CSS variables have updated
 */
export async function waitForThemeColors(page: Page, timeout = 5000): Promise<void> {
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const bg = getComputedStyle(html).getPropertyValue('--background');
      return bg && bg.trim() !== '';
    },
    { timeout }
  );
}
