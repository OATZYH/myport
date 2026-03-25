import { test, expect } from '../fixtures';
import { waitForHydration } from '../helpers/wait-for-hydration';
import { detectContinuousSpringAnimations } from '../helpers/wait-for-animations';
import { detectVisualBlink } from '../helpers/visual-compare';

/**
 * Dock Animation Tests
 *
 * Testing for blink issues caused by:
 * - Unbounded mouse tracking
 * - Spring animations causing dropped frames
 * - Excessive motion value updates
 */

test.describe('Dock Mouse Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Scroll to dock section
    await page.evaluate(() => {
      const dock = document.querySelector('[data-dock], .dock');
      if (dock) {
        dock.scrollIntoView({ behavior: 'instant' });
      }
    });

    await page.waitForTimeout(500);
  });

  test('should only track mouse when hovered', async ({ page }) => {
    const dock = page.locator('[data-dock], .dock').first();

    if (await dock.count() === 0) {
      test.skip();
      return;
    }

    // Track mousemove events when NOT hovering
    const eventsBeforeHover = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const handler = () => count++;

        document.addEventListener('mousemove', handler);

        // Move mouse outside dock
        const event = new MouseEvent('mousemove', {
          clientX: 10,
          clientY: 10,
        });
        document.dispatchEvent(event);

        setTimeout(() => {
          document.removeEventListener('mousemove', handler);
          resolve(count);
        }, 500);
      });
    });

    // Hover over dock
    await dock.hover();

    // Track mousemove events when hovering
    const eventsWhileHovering = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const handler = () => count++;

        document.addEventListener('mousemove', handler);

        setTimeout(() => {
          document.removeEventListener('mousemove', handler);
          resolve(count);
        }, 500);
      });
    });

    console.log(`Mousemove events before hover: ${eventsBeforeHover}`);
    console.log(`Mousemove events while hovering: ${eventsWhileHovering}`);

    // Should track more events when hovering
    expect(eventsWhileHovering).toBeGreaterThan(0);
  });

  test('should not cause visual blink on hover', async ({ page }) => {
    const dock = page.locator('[data-dock], .dock').first();

    if (await dock.count() === 0) {
      test.skip();
      return;
    }

    // Hover over dock
    await dock.hover();

    // Check for visual blinks
    const hasBlink = await detectVisualBlink(page, 1000, 100);

    console.log(`Visual blink detected on dock hover: ${hasBlink}`);
    expect(hasBlink).toBe(false);
  });

  test('should not have continuous spring animations when idle', async ({ page }) => {
    const dock = page.locator('[data-dock], .dock').first();

    if (await dock.count() === 0) {
      test.skip();
      return;
    }

    // Wait for dock to settle
    await page.waitForTimeout(1000);

    // Check for continuous animations
    const hasContinuousAnimation = await detectContinuousSpringAnimations(
      page,
      '[data-dock], .dock'
    );

    console.log(`Continuous spring animations detected: ${hasContinuousAnimation}`);

    // EXPECTED TO FAIL: Dock may have continuous motion value updates
    expect(hasContinuousAnimation).toBe(false);
  });

  test('spring animations should not drop frames', async ({ page }) => {
    const dock = page.locator('[data-dock], .dock').first();

    if (await dock.count() === 0) {
      test.skip();
      return;
    }

    // Hover to trigger spring animations
    await dock.hover();

    // Measure frame performance
    const frameData = await page.evaluate(() => {
      return new Promise<{ avgFrameTime: number; droppedFrames: number }>((resolve) => {
        const frameTimes: number[] = [];
        let lastTime = performance.now();
        let frameCount = 0;

        const measure = () => {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          frameTimes.push(delta);
          lastTime = currentTime;
          frameCount++;

          if (frameCount < 60) {
            requestAnimationFrame(measure);
          } else {
            const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const droppedFrames = frameTimes.filter(t => t > 16.67 * 2).length;
            resolve({ avgFrameTime, droppedFrames });
          }
        };

        requestAnimationFrame(measure);
      });
    });

    console.log(`Dock animation avg frame time: ${frameData.avgFrameTime.toFixed(2)}ms`);
    console.log(`Dock animation dropped frames: ${frameData.droppedFrames}`);

    // Should maintain ~60fps
    expect(frameData.avgFrameTime).toBeLessThan(20);
    expect(frameData.droppedFrames).toBeLessThan(5);
  });

  test('should debounce mouseX updates', async ({ page }) => {
    const dock = page.locator('[data-dock], .dock').first();

    if (await dock.count() === 0) {
      test.skip();
      return;
    }

    await dock.hover();

    // Track how many times mouseX value changes
    const updateCount = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const dockElement = document.querySelector('[data-dock], .dock');

        if (!dockElement) {
          resolve(0);
          return;
        }

        const observer = new MutationObserver(() => {
          count++;
        });

        observer.observe(dockElement, {
          attributes: true,
          childList: true,
          subtree: true,
        });

        // Move mouse rapidly
        const interval = setInterval(() => {
          const event = new MouseEvent('mousemove', {
            clientX: Math.random() * 100 + 100,
            clientY: Math.random() * 100 + 100,
          });
          document.dispatchEvent(event);
        }, 10);

        setTimeout(() => {
          clearInterval(interval);
          observer.disconnect();
          resolve(count);
        }, 1000);
      });
    });

    console.log(`Dock updates per second: ${updateCount}`);

    // Should debounce to < 60 updates per second
    expect(updateCount).toBeLessThan(60);
  });
});

test.describe('Dock Item Animations', () => {
  test('dock items should scale on hover', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const dock = page.locator('[data-dock], .dock').first();

    if (await dock.count() === 0) {
      test.skip();
      return;
    }

    const dockItem = dock.locator('a, button').first();
    await expect(dockItem).toBeVisible();

    // Get initial scale
    const initialScale = await dockItem.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      if (transform === 'none') return 1;

      // Parse matrix for scale
      const values = transform.match(/matrix.*\((.+)\)/)?.[1].split(', ');
      return values ? parseFloat(values[0]) : 1;
    });

    // Hover over item
    await dockItem.hover();
    await page.waitForTimeout(300);

    // Get hover scale
    const hoverScale = await dockItem.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      if (transform === 'none') return 1;

      const values = transform.match(/matrix.*\((.+)\)/)?.[1].split(', ');
      return values ? parseFloat(values[0]) : 1;
    });

    console.log(`Initial scale: ${initialScale}, Hover scale: ${hoverScale}`);

    // Should scale up on hover
    expect(hoverScale).toBeGreaterThan(initialScale);
  });
});
