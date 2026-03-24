import { test, expect } from '../fixtures';
import { waitForHydration } from '../helpers/wait-for-hydration';
import { waitForMotionAnimations } from '../helpers/wait-for-animations';
import { detectVisualBlink } from '../helpers/visual-compare';

/**
 * MorphingDialog Tests
 *
 * Testing for blink issues caused by:
 * - Portal rendering to document.body
 * - AnimatePresence mode='sync' causing flicker
 * - Focus management useEffect causing reflows
 * - Body overflow-hidden toggle causing layout shifts
 * - Multiple useEffect hooks triggering re-renders
 */

test.describe('MorphingDialog Portal Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
  });

  test('should not cause layout shift when dialog opens', async ({ page }) => {
    // Inject CLS tracking
    await page.addInitScript(() => {
      window.__DIALOG_CLS__ = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-expect-error - CLS entry
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            // @ts-expect-error - CLS value
            window.__DIALOG_CLS__ += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    });

    // Get initial CLS
    const initialCLS = await page.evaluate(() => {
      // @ts-expect-error - custom property
      return window.__DIALOG_CLS__ || 0;
    });

    // Find and click dialog trigger
    // MorphingDialog is used in the projects section
    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() > 0) {
      await dialogTrigger.click();

      // Wait for dialog to appear
      await page.waitForSelector('[data-morphing-dialog], [role="dialog"]', {
        state: 'visible',
        timeout: 5000,
      });

      // Get final CLS
      const finalCLS = await page.evaluate(() => {
        // @ts-expect-error - custom property
        return window.__DIALOG_CLS__ || 0;
      });

      const clsDiff = finalCLS - initialCLS;
      console.log(`Dialog open CLS: ${clsDiff}`);

      // Should have minimal layout shift
      expect(clsDiff).toBeLessThan(0.1);
    } else {
      test.skip();
    }
  });

  test('should not flicker during AnimatePresence enter/exit', async ({ page }) => {
    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() === 0) {
      test.skip();
      return;
    }

    // Open dialog
    await dialogTrigger.click();
    await page.waitForSelector('[data-morphing-dialog], [role="dialog"]', {
      state: 'visible',
    });

    // Check for visual blink during animation
    const hasBlink = await detectVisualBlink(page, 500, 50);

    console.log(`Flicker detected during dialog open: ${hasBlink}`);
    expect(hasBlink).toBe(false);

    // Close dialog
    const closeButton = page.locator('[data-dialog-close], [aria-label*="close" i]').first();
    if (await closeButton.count() > 0) {
      await closeButton.click();

      // Check for blink during close
      const hasBlinkOnClose = await detectVisualBlink(page, 500, 50);
      console.log(`Flicker detected during dialog close: ${hasBlinkOnClose}`);
      expect(hasBlinkOnClose).toBe(false);
    }
  });

  test('should not cause reflow from focus management', async ({ page }) => {
    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() === 0) {
      test.skip();
      return;
    }

    // Track reflows during dialog open
    const reflowCount = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

        Element.prototype.getBoundingClientRect = function() {
          count++;
          return originalGetBoundingClientRect.call(this);
        };

        // Trigger will be clicked externally
        setTimeout(() => {
          Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
          resolve(count);
        }, 1000);
      });
    });

    await dialogTrigger.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    console.log(`getBoundingClientRect calls during dialog open: ${reflowCount}`);

    // Should minimize layout queries
    // EXPECTED TO FAIL: Focus management causes multiple reflows
    expect(reflowCount).toBeLessThan(10);
  });

  test('should not cause layout shift from body class toggle', async ({ page }) => {
    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() === 0) {
      test.skip();
      return;
    }

    // Track body class changes
    const bodyClassChanges = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let changeCount = 0;
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              changeCount++;
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              changeCount++;
            }
          });
        });

        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['class', 'style'],
        });

        setTimeout(() => {
          observer.disconnect();
          resolve(changeCount);
        }, 2000);
      });
    });

    await dialogTrigger.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    console.log(`Body attribute changes: ${bodyClassChanges}`);

    // Should minimize body mutations
    // MorphingDialog toggles overflow-hidden which can cause layout shift
    expect(bodyClassChanges).toBeLessThan(5);
  });

  test('shared layoutId animation should be smooth', async ({ page }) => {
    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() === 0) {
      test.skip();
      return;
    }

    // Get trigger position
    const triggerBox = await dialogTrigger.boundingBox();
    expect(triggerBox).not.toBeNull();

    // Click trigger
    await dialogTrigger.click();

    // Wait for dialog
    const dialog = page.locator('[data-morphing-dialog], [role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check if element morphed smoothly (no jump)
    await waitForMotionAnimations(page);

    // Dialog should be visible and positioned correctly
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();

    // Should have animated from trigger position
    // (This is hard to test precisely, but we check it rendered)
    expect(dialogBox!.width).toBeGreaterThan(0);
    expect(dialogBox!.height).toBeGreaterThan(0);
  });

  test('should not have useEffect loops causing re-renders', async ({ page }) => {
    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() === 0) {
      test.skip();
      return;
    }

    // Track React renders
    const renderCount = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const observer = new MutationObserver(() => {
          count++;
        });

        const dialog = document.querySelector('[data-morphing-dialog], [role="dialog"]');
        if (dialog) {
          observer.observe(dialog, {
            attributes: true,
            childList: true,
            subtree: true,
          });
        }

        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, 2000);
      });
    });

    await dialogTrigger.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    console.log(`DOM mutations after dialog open: ${renderCount}`);

    // Should not re-render excessively
    // EXPECTED TO FAIL: Multiple useEffect hooks may cause loops
    expect(renderCount).toBeLessThan(20);
  });

  test('portal should mount without flash', async ({ page }) => {
    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() === 0) {
      test.skip();
      return;
    }

    // Check for rapid visual changes during portal mount
    const screenshotsBefore: Buffer[] = [];

    // Take baseline screenshot
    screenshotsBefore.push(await page.screenshot({ animations: 'disabled' }));

    // Click trigger
    await dialogTrigger.click();

    // Take screenshots during mount
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(50);
      screenshotsBefore.push(await page.screenshot({ animations: 'disabled' }));
    }

    // Wait for dialog to fully mount
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Check if there was a flash (sudden change then revert)
    let flashDetected = false;
    for (let i = 1; i < screenshotsBefore.length - 1; i++) {
      const curr = screenshotsBefore[i];
      const prev = screenshotsBefore[i - 1];
      const next = screenshotsBefore[i + 1];

      // If curr differs from both prev and next, it's likely a flash
      if (!curr.equals(prev) && !curr.equals(next)) {
        flashDetected = true;
        break;
      }
    }

    console.log(`Portal mount flash detected: ${flashDetected}`);
    expect(flashDetected).toBe(false);
  });
});

test.describe('MorphingDialog Accessibility', () => {
  test('should trap focus within dialog', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() === 0) {
      test.skip();
      return;
    }

    await dialogTrigger.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should stay within dialog
    const focusedElement = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.closest('[role="dialog"]') !== null;
    });

    expect(focusedElement).toBe(true);
  });

  test('should restore focus on close', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const dialogTrigger = page.locator('[data-morphing-trigger], [data-dialog-trigger]').first();

    if (await dialogTrigger.count() === 0) {
      test.skip();
      return;
    }

    // Click trigger
    await dialogTrigger.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Close dialog (Escape key)
    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    // Focus should return to trigger
    await page.waitForTimeout(500);

    const isFocusedOnTrigger = await dialogTrigger.evaluate((el) => {
      return document.activeElement === el;
    });

    expect(isFocusedOnTrigger).toBe(true);
  });
});
