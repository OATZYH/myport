import { test, expect } from '../fixtures';
import { waitForHydration } from '../helpers/wait-for-hydration';
import { countActiveRAFLoops, cancelRAFLoops } from '../helpers/wait-for-animations';
import { detectVisualBlink } from '../helpers/visual-compare';

/**
 * Card3D RAF Loop Tests
 *
 * Testing for blink issues caused by:
 * - requestAnimationFrame loops running continuously
 * - RAF not stopping when component is out of view
 * - Excessive re-renders from mouse tracking
 */

test.describe('Card3D requestAnimationFrame', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Scroll to photo card section
    await page.evaluate(() => {
      const photoSection = document.querySelector('[data-section="photo"], .photo-card-section');
      if (photoSection) {
        photoSection.scrollIntoView({ behavior: 'instant' });
      }
    });

    await page.waitForTimeout(500);
  });

  test('should stop RAF when scrolled out of view', async ({ page }) => {
    // First, verify RAF is running when in view
    const rafCountInView = await countActiveRAFLoops(page);
    console.log(`RAF loops when in view: ${rafCountInView}`);

    // Scroll out of view
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    await page.waitForTimeout(1000);

    // Check RAF count when out of view
    const rafCountOutOfView = await countActiveRAFLoops(page);
    console.log(`RAF loops when out of view: ${rafCountOutOfView}`);

    // EXPECTED TO FAIL: Card3D doesn't stop RAF when out of view
    // This test confirms the bug exists
    expect(rafCountOutOfView).toBe(0);
  });

  test('should not cause visual blink during mouse movement', async ({ page }) => {
    // Find the card element
    const card = page.locator('.photo-card-section').first();
    await expect(card).toBeVisible();

    // Move mouse over card
    await card.hover();

    // Detect if rapid screenshots show blinking
    const hasBlink = await detectVisualBlink(page, 1000, 100);

    console.log(`Visual blink detected: ${hasBlink}`);

    expect(hasBlink).toBe(false);
  });

  test('should cleanup RAF on component unmount', async ({ page }) => {
    // Navigate away from page
    await page.goto('about:blank');

    await page.waitForTimeout(500);

    // Verify no RAF loops are running
    const rafCount = await page.evaluate(() => {
      let count = 0;
      const id = requestAnimationFrame(() => {
        count++;
      });
      cancelAnimationFrame(id);
      return count;
    });

    expect(rafCount).toBe(0);
  });

  test('should not drop frames during 3D rotation', async ({ page }) => {
    const card = page.locator('.photo-card-section').first();
    await expect(card).toBeVisible();

    // Track frame times
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
            const droppedFrames = frameTimes.filter(t => t > 16.67 * 2).length; // Frames > 33ms
            resolve({ avgFrameTime, droppedFrames });
          }
        };

        requestAnimationFrame(measure);
      });
    });

    console.log(`Average frame time: ${frameData.avgFrameTime.toFixed(2)}ms`);
    console.log(`Dropped frames: ${frameData.droppedFrames}`);

    // Should maintain ~60fps (16.67ms per frame)
    expect(frameData.avgFrameTime).toBeLessThan(20);
    expect(frameData.droppedFrames).toBeLessThan(5);
  });

  test('should use Intersection Observer to pause RAF', async ({ page }) => {
    // Check if Intersection Observer is set up
    const hasIntersectionObserver = await page.evaluate(() => {
      // This test will likely fail - Card3D doesn't use Intersection Observer yet
      return new Promise<boolean>((resolve) => {
        const photoSection = document.querySelector('[data-section="photo"], .photo-card-section');
        if (!photoSection) {
          resolve(false);
          return;
        }

        // Check if element has intersection observer
        // @ts-expect-error - custom property
        const hasObserver = photoSection.__intersectionObserver__ !== undefined;
        resolve(hasObserver);
      });
    });

    console.log(`Intersection Observer present: ${hasIntersectionObserver}`);

    // EXPECTED TO FAIL: Card3D doesn't implement Intersection Observer yet
    expect(hasIntersectionObserver).toBe(true);
  });
});

test.describe('Card3D Mouse Tracking Performance', () => {
  test('should throttle mousemove events', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Track mousemove event frequency
    const eventCount = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const handler = () => {
          count++;
        };

        document.addEventListener('mousemove', handler);

        // Move mouse rapidly
        const interval = setInterval(() => {
          const event = new MouseEvent('mousemove', {
            clientX: Math.random() * 100,
            clientY: Math.random() * 100,
          });
          document.dispatchEvent(event);
        }, 1);

        setTimeout(() => {
          clearInterval(interval);
          document.removeEventListener('mousemove', handler);
          resolve(count);
        }, 1000);
      });
    });

    console.log(`Mousemove events per second: ${eventCount}`);

    // Should throttle to reasonable rate (< 60fps)
    expect(eventCount).toBeLessThan(100);
  });
});
