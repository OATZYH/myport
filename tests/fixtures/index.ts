import { test as base } from '@playwright/test';
import { waitForHydration } from '../helpers/wait-for-hydration';
import { disableAnimations } from '../helpers/wait-for-animations';

/**
 * Custom Playwright Fixtures
 * Extends base test with auto-navigation and hydration waiting
 */

type CustomFixtures = {
  /** Auto-navigates to home page and waits for hydration */
  hydrated: void;
  /** Disables all animations for stable testing */
  noAnimations: void;
};

export const test = base.extend<CustomFixtures>({
  // Hydrated fixture: auto-navigate and wait for hydration
  hydrated: async ({ page }, use) => {
    await page.goto('/');
    await waitForHydration(page);
    await use();
  },

  // No animations fixture: disable all CSS/JS animations
  noAnimations: async ({ page }, use) => {
    await disableAnimations(page);
    await use();
  },
});

export { expect } from '@playwright/test';
