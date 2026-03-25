import { test, expect } from '../fixtures';
import { waitForHydration } from '../helpers/wait-for-hydration';

/**
 * Font Loading Tests
 *
 * Testing for:
 * - Flash of Unstyled Content (FOUC)
 * - DM Sans font loading
 * - Font preloading
 * - Layout shift during font swap
 */

test.describe('Font Loading', () => {
  test('DM Sans should load before first paint', async ({ page }) => {
    // Track font loading
    await page.addInitScript(() => {
      window.__FONT_LOAD_TIME__ = 0;
      window.__FIRST_PAINT__ = 0;

      document.fonts.ready.then(() => {
        window.__FONT_LOAD_TIME__ = performance.now();
      });

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint' || entry.name === 'first-contentful-paint') {
            // @ts-expect-error - timing
            window.__FIRST_PAINT__ = entry.startTime;
          }
        }
      });

      observer.observe({ type: 'paint', buffered: true });
    });

    await page.goto('/');
    await waitForHydration(page);

    const timing = await page.evaluate(() => ({
      // @ts-expect-error - custom property
      fontLoadTime: window.__FONT_LOAD_TIME__,
      // @ts-expect-error - custom property
      firstPaint: window.__FIRST_PAINT__,
    }));

    console.log(`Font load time: ${timing.fontLoadTime}ms`);
    console.log(`First paint: ${timing.firstPaint}ms`);

    // Font should load close to first paint (within 500ms)
    // EXPECTED TO FAIL if fonts aren't preloaded
    expect(timing.fontLoadTime - timing.firstPaint).toBeLessThan(500);
  });

  test('should have font-display: swap configured', async ({ page }) => {
    await page.goto('/');

    // Check font-face rules
    const hasFontDisplaySwap = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);

      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            // @ts-expect-error - CSSFontFaceRule
            if (rule.type === CSSRule.FONT_FACE_RULE && rule.style) {
              // @ts-expect-error - fontDisplay
              const fontDisplay = rule.style.fontDisplay;
              const fontFamily = rule.style.fontFamily;

              if (fontFamily?.includes('DM Sans')) {
                return fontDisplay === 'swap';
              }
            }
          }
        } catch (e) {
          // CORS sheets
        }
      }

      return false;
    });

    console.log(`DM Sans has font-display: swap: ${hasFontDisplaySwap}`);

    expect(hasFontDisplaySwap).toBe(true);
  });

  test('layout shift score during font load should be minimal', async ({ page }) => {
    // Track CLS during font loading
    await page.addInitScript(() => {
      window.__FONT_CLS__ = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-expect-error - CLS entry
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            // @ts-expect-error - CLS value
            window.__FONT_CLS__ += entry.value;
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/');
    await waitForHydration(page);

    // Wait for fonts to fully load
    await page.evaluate(() => document.fonts.ready);

    const clsScore = await page.evaluate(() => {
      // @ts-expect-error - custom property
      return window.__FONT_CLS__ || 0;
    });

    console.log(`Font loading CLS: ${clsScore}`);

    // CLS should be less than 0.1 (good)
    // EXPECTED TO FAIL if fonts cause layout shift
    expect(clsScore).toBeLessThan(0.1);
  });

  test('should preload DM Sans font files', async ({ page }) => {
    await page.goto('/');

    // Check for preload links
    const hasPreload = await page.evaluate(() => {
      const preloads = document.querySelectorAll('link[rel="preload"][as="font"]');

      return Array.from(preloads).some(link => {
        const href = link.getAttribute('href');
        return href?.includes('DM') || href?.includes('dm-sans');
      });
    });

    console.log(`DM Sans is preloaded: ${hasPreload}`);

    // EXPECTED TO FAIL if fonts aren't preloaded
    expect(hasPreload).toBe(true);
  });

  test('all fonts should be loaded before content render', async ({ page }) => {
    await page.goto('/');

    const allFontsLoaded = await page.evaluate(async () => {
      await document.fonts.ready;

      // Check if all fonts are loaded
      const fonts = Array.from(document.fonts);
      return fonts.every(font => font.status === 'loaded');
    });

    expect(allFontsLoaded).toBe(true);
  });

  test('should not show fallback font flash', async ({ page }) => {
    // Track font changes
    const fontChanges = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let changeCount = 0;
        const observer = new MutationObserver(() => {
          changeCount++;
        });

        const body = document.body;
        observer.observe(body, {
          attributes: true,
          attributeFilter: ['style'],
          subtree: true,
        });

        setTimeout(() => {
          observer.disconnect();
          resolve(changeCount);
        }, 2000);
      });
    });

    await page.goto('/');
    await waitForHydration(page);

    console.log(`Font-related style changes: ${fontChanges}`);

    // Should have minimal font changes (no flash)
    expect(fontChanges).toBeLessThan(10);
  });

  test('body text should use DM Sans', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const bodyFont = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return computedStyle.fontFamily;
    });

    console.log(`Body font family: ${bodyFont}`);

    // Should include DM Sans
    expect(bodyFont).toContain('DM Sans');
  });
});

test.describe('Font Performance', () => {
  test('should load fonts within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    await page.evaluate(() => document.fonts.ready);

    const loadTime = Date.now() - startTime;

    console.log(`Fonts loaded in ${loadTime}ms`);

    expect(loadTime).toBeLessThan(3000);
  });

  test('font files should be cached', async ({ page }) => {
    // First load
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    // Second load (should use cache)
    await page.reload();

    const fromCache = await page.evaluate(async () => {
      await document.fonts.ready;

      // Check if fonts loaded from cache
      const performance = window.performance;
      const resources = performance.getEntriesByType('resource');

      return resources.some(entry => {
        // @ts-expect-error - resource timing
        const transferSize = entry.transferSize;
        const name = entry.name;

        return (name.includes('font') || name.includes('.woff2')) &&
               transferSize === 0; // 0 means from cache
      });
    });

    console.log(`Fonts loaded from cache: ${fromCache}`);

    expect(fromCache).toBe(true);
  });
});
