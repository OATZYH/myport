import { test, expect } from '../fixtures';
import { waitForHydration } from '../helpers/wait-for-hydration';
import { disableAnimations, waitForBlurFade } from '../helpers/wait-for-animations';
import { getCurrentTheme, setThemeWithoutAnimation } from '../helpers/theme-helpers';

/**
 * Visual Regression Tests
 *
 * Baseline screenshots for detecting visual changes
 * These tests establish "known good" states and catch regressions
 */

test.describe('Homepage Visual Regression', () => {
  test('homepage - light mode - full page', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Set light mode
    await setThemeWithoutAnimation(page, 'light');

    // Disable animations for stable screenshot
    await disableAnimations(page);

    // Wait for all BlurFade animations (estimate 20 items)
    await waitForBlurFade(page, 20);

    await expect(page).toHaveScreenshot('homepage-light-full.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('homepage - dark mode - full page', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Set dark mode
    await setThemeWithoutAnimation(page, 'dark');

    // Disable animations
    await disableAnimations(page);

    // Wait for BlurFade
    await waitForBlurFade(page, 20);

    await expect(page).toHaveScreenshot('homepage-dark-full.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('homepage - above the fold - light', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    await setThemeWithoutAnimation(page, 'light');
    await disableAnimations(page);

    await expect(page).toHaveScreenshot('homepage-atf-light.png', {
      fullPage: false,
      animations: 'disabled',
      threshold: 0.2,
    });
  });

  test('homepage - above the fold - dark', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    await setThemeWithoutAnimation(page, 'dark');
    await disableAnimations(page);

    await expect(page).toHaveScreenshot('homepage-atf-dark.png', {
      fullPage: false,
      animations: 'disabled',
      threshold: 0.2,
    });
  });
});

test.describe('Component Visual Regression', () => {
  test('dock - initial state', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await disableAnimations(page);

    // Scroll to dock
    await page.evaluate(() => {
      const dock = document.querySelector('[data-dock], .dock');
      if (dock) {
        dock.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    await page.waitForTimeout(500);

    const dock = page.locator('[data-dock], .dock').first();

    if (await dock.count() > 0) {
      await expect(dock).toHaveScreenshot('dock-initial.png', {
        animations: 'disabled',
        threshold: 0.2,
      });
    } else {
      test.skip();
    }
  });

  test('dock - hovered state', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await disableAnimations(page);

    await page.evaluate(() => {
      const dock = document.querySelector('[data-dock], .dock');
      if (dock) {
        dock.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    const dock = page.locator('[data-dock], .dock').first();

    if (await dock.count() === 0) {
      test.skip();
      return;
    }

    // Hover over dock
    await dock.hover();
    await page.waitForTimeout(500);

    await expect(dock).toHaveScreenshot('dock-hovered.png', {
      animations: 'disabled',
      threshold: 0.2,
    });
  });

  test('photo cards section', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await disableAnimations(page);

    // Scroll to photo section
    await page.evaluate(() => {
      const photoSection = document.querySelector('[data-section="photo"], .photo-card-section');
      if (photoSection) {
        photoSection.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    await page.waitForTimeout(500);

    const photoSection = page.locator('[data-section="photo"], .photo-card-section').first();

    if (await photoSection.count() > 0) {
      await expect(photoSection).toHaveScreenshot('photo-cards-section.png', {
        animations: 'disabled',
        threshold: 0.2,
      });
    } else {
      test.skip();
    }
  });

  test('theme toggle button', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await disableAnimations(page);

    const themeButton = page.locator('[aria-label*="theme" i], [data-theme-toggle]').first();

    if (await themeButton.count() > 0) {
      await expect(themeButton).toHaveScreenshot('theme-toggle-button.png', {
        animations: 'disabled',
        threshold: 0.2,
      });
    } else {
      test.skip();
    }
  });
});

test.describe('Section Visual Regression', () => {
  const sections = ['work', 'education', 'projects', 'contact'];

  for (const section of sections) {
    test(`${section} section - light mode`, async ({ page }) => {
      await page.goto('/');
      await waitForHydration(page);
      await setThemeWithoutAnimation(page, 'light');
      await disableAnimations(page);

      // Scroll to section
      await page.evaluate((sectionName) => {
        const sectionElement = document.querySelector(`[data-section="${sectionName}"]`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }, section);

      await page.waitForTimeout(500);

      const sectionElement = page.locator(`[data-section="${section}"]`).first();

      if (await sectionElement.count() > 0) {
        await expect(sectionElement).toHaveScreenshot(`section-${section}-light.png`, {
          animations: 'disabled',
          threshold: 0.2,
        });
      } else {
        test.skip();
      }
    });

    test(`${section} section - dark mode`, async ({ page }) => {
      await page.goto('/');
      await waitForHydration(page);
      await setThemeWithoutAnimation(page, 'dark');
      await disableAnimations(page);

      await page.evaluate((sectionName) => {
        const sectionElement = document.querySelector(`[data-section="${sectionName}"]`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }, section);

      await page.waitForTimeout(500);

      const sectionElement = page.locator(`[data-section="${section}"]`).first();

      if (await sectionElement.count() > 0) {
        await expect(sectionElement).toHaveScreenshot(`section-${section}-dark.png`, {
          animations: 'disabled',
          threshold: 0.2,
        });
      } else {
        test.skip();
      }
    });
  }
});

test.describe('Mobile Visual Regression', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('mobile - homepage - light', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await setThemeWithoutAnimation(page, 'light');
    await disableAnimations(page);

    await expect(page).toHaveScreenshot('mobile-homepage-light.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });

  test('mobile - homepage - dark', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await setThemeWithoutAnimation(page, 'dark');
    await disableAnimations(page);

    await expect(page).toHaveScreenshot('mobile-homepage-dark.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });
});
