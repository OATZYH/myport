import { Page, expect } from '@playwright/test';

/**
 * Visual Comparison Helper
 * Utilities for screenshot comparison and visual regression testing
 */

export interface ScreenshotOptions {
  /** Full page screenshot (default: false) */
  fullPage?: boolean;
  /** Animations: 'disabled' | 'allow' (default: 'disabled') */
  animations?: 'disabled' | 'allow';
  /** Comparison threshold 0-1 (default: 0.2) */
  threshold?: number;
  /** Max pixel diff ratio to tolerate 0-1 (default: 0.01) */
  maxDiffPixelRatio?: number;
}

/**
 * Capture before and after screenshots around an action
 * Useful for detecting visual changes
 */
export async function captureBeforeAfterScreenshots(
  page: Page,
  action: () => Promise<void>,
  name: string,
  options: ScreenshotOptions = {}
): Promise<{ before: Buffer; after: Buffer }> {
  const {
    fullPage = false,
    animations = 'disabled',
  } = options;

  // Disable animations if requested
  if (animations === 'disabled') {
    await page.addStyleTag({
      content: `
        *,
        *::before,
        *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });
  }

  // Wait for page to stabilize
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Take before screenshot
  const before = await page.screenshot({
    fullPage,
    animations: animations === 'disabled' ? 'disabled' : 'allow',
  });

  // Perform action
  await action();

  // Wait for changes to complete
  await page.waitForTimeout(500);

  // Take after screenshot
  const after = await page.screenshot({
    fullPage,
    animations: animations === 'disabled' ? 'disabled' : 'allow',
  });

  return { before, after };
}

/**
 * Detect visual blink by taking rapid screenshots
 * Returns true if screenshots differ significantly
 */
export async function detectVisualBlink(
  page: Page,
  duration = 1000,
  interval = 100
): Promise<boolean> {
  const screenshots: Buffer[] = [];
  const iterations = Math.floor(duration / interval);

  // Capture screenshots at intervals
  for (let i = 0; i < iterations; i++) {
    const screenshot = await page.screenshot({
      animations: 'disabled',
    });
    screenshots.push(screenshot);
    await page.waitForTimeout(interval);
  }

  // Compare consecutive screenshots
  // If any pair differs significantly, we detected a blink
  for (let i = 1; i < screenshots.length; i++) {
    if (!screenshots[i].equals(screenshots[i - 1])) {
      return true; // Detected visual difference (potential blink)
    }
  }

  return false; // No blinks detected
}

/**
 * Take a stable screenshot for visual regression
 * Waits for animations and ensures page is stable
 */
export async function takeStableScreenshot(
  page: Page,
  name: string,
  options: ScreenshotOptions = {}
): Promise<void> {
  const {
    fullPage = false,
    threshold = 0.2,
    maxDiffPixelRatio = 0.01,
  } = options;

  // Disable animations
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });

  // Wait for network and animations
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Take screenshot and compare
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage,
    animations: 'disabled',
    threshold,
    maxDiffPixelRatio,
  });
}

/**
 * Compare element before and after action
 * Useful for testing specific component changes
 */
export async function compareElementChange(
  page: Page,
  selector: string,
  action: () => Promise<void>,
  name: string,
  options: ScreenshotOptions = {}
): Promise<void> {
  const {
    threshold = 0.2,
    maxDiffPixelRatio = 0.01,
  } = options;

  const element = page.locator(selector);

  // Take before screenshot
  await expect(element).toHaveScreenshot(`${name}-before.png`, {
    animations: 'disabled',
    threshold,
    maxDiffPixelRatio,
  });

  // Perform action
  await action();
  await page.waitForTimeout(500);

  // Take after screenshot
  await expect(element).toHaveScreenshot(`${name}-after.png`, {
    animations: 'disabled',
    threshold,
    maxDiffPixelRatio,
  });
}

/**
 * Capture video of an action
 * Returns path to video file
 */
export async function captureActionVideo(
  page: Page,
  action: () => Promise<void>,
  name: string
): Promise<string | null> {
  // Note: Video recording is configured in playwright.config.ts
  // This is just a wrapper to ensure action is captured
  await action();

  // Return video path (available after test completes)
  const video = page.video();
  if (!video) return null;

  return await video.path();
}

/**
 * Wait for element to stop moving
 * Useful for detecting when animations have truly settled
 */
export async function waitForElementToStopMoving(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel);
      if (!element) return true;

      const rect = element.getBoundingClientRect();
      // Store position
      // @ts-expect-error - custom property
      if (!element.__lastRect__) {
        // @ts-expect-error - custom property
        element.__lastRect__ = rect;
        return false;
      }

      // @ts-expect-error - custom property
      const lastRect = element.__lastRect__;
      const moved =
        Math.abs(rect.top - lastRect.top) > 1 ||
        Math.abs(rect.left - lastRect.left) > 1 ||
        Math.abs(rect.width - lastRect.width) > 1 ||
        Math.abs(rect.height - lastRect.height) > 1;

      if (moved) {
        // @ts-expect-error - custom property
        element.__lastRect__ = rect;
        return false;
      }

      return true; // Element has stopped moving
    },
    selector,
    { timeout, polling: 100 }
  );
}
