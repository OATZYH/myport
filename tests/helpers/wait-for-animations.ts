import { Page } from '@playwright/test';

/**
 * Animation Helper
 * Utilities for waiting, disabling, and debugging framer-motion animations
 */

export interface AnimationOptions {
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Selector to wait for (optional) */
  selector?: string;
}

/**
 * Wait for framer-motion animations to settle
 * Checks if motion values have stopped updating
 */
export async function waitForMotionAnimations(
  page: Page,
  options: AnimationOptions = {}
): Promise<void> {
  const { timeout = 10000, selector } = options;

  await page.waitForFunction(
    (sel) => {
      // Check if any elements have ongoing transitions/animations
      const elements = sel
        ? document.querySelectorAll(sel)
        : document.querySelectorAll('[data-framer-component]');

      if (elements.length === 0) {
        // If no motion elements found, check for any CSS animations
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const styles = window.getComputedStyle(el);
          if (
            styles.animationName !== 'none' ||
            styles.transitionDuration !== '0s'
          ) {
            return false; // Still animating
          }
        }
        return true; // No animations found
      }

      // Check motion elements
      for (const el of elements) {
        const styles = window.getComputedStyle(el);
        if (
          styles.animationName !== 'none' ||
          styles.transitionDuration !== '0s'
        ) {
          return false; // Still animating
        }
      }

      return true; // All animations complete
    },
    selector,
    { timeout }
  ).catch(() => {
    console.warn('Animation wait timed out, continuing anyway');
  });

  // Extra small delay for safety
  await page.waitForTimeout(100);
}

/**
 * Disable all animations and transitions
 * Useful for visual regression tests to prevent flakiness
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }

      /* Disable framer-motion animations */
      [data-framer-component] {
        animation: none !important;
        transition: none !important;
      }
    `,
  });
}

/**
 * Cancel all requestAnimationFrame loops
 * Useful for testing Card3D RAF issues
 */
export async function cancelRAFLoops(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Store original RAF
    const originalRAF = window.requestAnimationFrame;
    const rafIds: number[] = [];

    // Override RAF to track IDs
    window.requestAnimationFrame = function (callback) {
      const id = originalRAF(callback);
      rafIds.push(id);
      return id;
    };

    // Cancel all tracked RAFs after a delay
    setTimeout(() => {
      rafIds.forEach((id) => window.cancelAnimationFrame(id));
    }, 100);
  });
}

/**
 * Count active requestAnimationFrame loops
 * Returns the number of RAF callbacks currently scheduled
 */
export async function countActiveRAFLoops(page: Page): Promise<number> {
  return await page.evaluate(() => {
    let rafCount = 0;
    const originalRAF = window.requestAnimationFrame;

    // Override RAF to count calls
    window.requestAnimationFrame = function (callback) {
      rafCount++;
      return originalRAF(() => {
        rafCount--;
        callback(Date.now());
      });
    };

    // Wait a bit to let RAF loops run
    return new Promise<number>((resolve) => {
      setTimeout(() => resolve(rafCount), 500);
    });
  });
}

/**
 * Wait for BlurFade animations to complete
 * BlurFade uses sequential delays, so calculate total delay
 */
export async function waitForBlurFade(
  page: Page,
  count: number,
  delayPerItem = 0.04 // Default BlurFade delay
): Promise<void> {
  const totalDelay = count * delayPerItem * 1000; // Convert to ms
  await page.waitForTimeout(totalDelay + 500); // Add buffer
}

/**
 * Detect if View Transitions API is causing re-renders
 * Returns true if excessive DOM mutations detected during transition
 */
export async function detectViewTransitionMutations(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let mutationCount = 0;
      const observer = new MutationObserver((mutations) => {
        mutationCount += mutations.length;
      });

      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      // Count mutations for 2 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(mutationCount);
      }, 2000);
    });
  });
}

/**
 * Check if spring animations are running continuously
 * Returns true if motion values are updating more than 60 times per second
 */
export async function detectContinuousSpringAnimations(
  page: Page,
  selector: string
): Promise<boolean> {
  return await page.evaluate((sel) => {
    return new Promise<boolean>((resolve) => {
      const element = document.querySelector(sel);
      if (!element) {
        resolve(false);
        return;
      }

      let updateCount = 0;
      const observer = new MutationObserver(() => {
        updateCount++;
      });

      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style'],
      });

      // Check if updates exceed 60fps
      setTimeout(() => {
        observer.disconnect();
        resolve(updateCount > 60); // More than 60 updates in 1 second
      }, 1000);
    });
  }, selector);
}

/**
 * Wait for CSS animation to complete
 */
export async function waitForCSSAnimation(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel);
      if (!element) return true;

      const styles = window.getComputedStyle(element);
      return styles.animationName === 'none';
    },
    selector,
    { timeout }
  );
}
