# Playwright Testing Suite - Screen Blink Debugging

This Playwright test suite is designed to detect and debug screen blink issues in the Next.js portfolio application.

## Overview

The portfolio has a **screen blinking issue** in newly added components. This test suite identifies four primary causes:

1. **AnimatedThemeToggler** - View Transition API with `flushSync` + MutationObserver loops
2. **Card3D** - RequestAnimationFrame loops running continuously even when not visible
3. **Dock** - Unbounded mouse tracking with spring animations
4. **MorphingDialog** - Portal rendering + AnimatePresence + focus management causing layout shifts

## Installation

```bash
# Install dependencies
bun add -D @playwright/test

# Install browsers
bunx playwright install chromium
```

## Running Tests

```bash
# Run all tests
bun run test

# Run specific test file
bunx playwright test tests/e2e/theme-toggle.spec.ts

# Run tests in UI mode (interactive)
bun run test:ui

# Run tests in headed mode (see browser)
bun run test:headed

# Debug tests
bun run test:debug

# View test report
bun run test:report

# Generate code (record actions)
bun run test:codegen
```

## Test Files

### Critical Tests (Expected Failures)

These tests are **expected to fail** initially - they confirm the blink bugs exist:

- **`theme-toggle.spec.ts`** ⭐ - Tests AnimatedThemeToggler for flushSync warnings and excessive mutations
- **`card3d.spec.ts`** ⭐ - Tests Card3D RAF loops (WILL FAIL - confirmed bug)
- **`morphing-dialog.spec.ts`** ⭐ - Tests MorphingDialog portal rendering and layout shifts

### Supporting Tests

- **`hydration.spec.ts`** - React 19 hydration, theme provider, suppressHydrationWarning
- **`dock.spec.ts`** - Dock mouse tracking and spring animations
- **`font-loading.spec.ts`** - DM Sans font loading and FOUC detection
- **`visual-regression.spec.ts`** - Baseline screenshots for visual comparison

## Helper Utilities

Located in `tests/helpers/`:

- **`wait-for-hydration.ts`** - Hydration detection, CLS measurement
- **`wait-for-animations.ts`** - Animation helpers, RAF detection, BlurFade waiting
- **`theme-helpers.ts`** - Theme toggle utilities, mutation counting
- **`visual-compare.ts`** - Screenshot comparison, blink detection

## Expected Test Results

| Test File | Expected Result | Reason |
|-----------|----------------|--------|
| `hydration.spec.ts` | ✅ PASS | Hydration working correctly |
| `theme-toggle.spec.ts` | ⚠️ MAY FAIL | MutationObserver loop or flushSync warning |
| `card3d.spec.ts` | ❌ FAIL | RAF runs when not visible (confirmed bug) |
| `dock.spec.ts` | ⚠️ MAY FAIL | Excessive mouseX updates |
| `morphing-dialog.spec.ts` | ⚠️ MAY FAIL | Layout shift from portal or body class toggle |
| `font-loading.spec.ts` | ⚠️ MAY FAIL | DM Sans not preloaded, high CLS |
| `visual-regression.spec.ts` | ✅ PASS | After baselines generated |

**Note**: Failures are GOOD - they confirm Playwright is catching the blink issues!

## Debugging Workflow

### 1. Generate Baseline Screenshots

First time running visual regression tests:

```bash
bunx playwright test visual-regression.spec.ts --update-snapshots
```

### 2. Run Critical Tests

Start with the most important blink tests:

```bash
# Theme toggle blink
bunx playwright test tests/e2e/theme-toggle.spec.ts --headed

# Card3D RAF issue
bunx playwright test tests/e2e/card3d.spec.ts --headed

# MorphingDialog layout shift
bunx playwright test tests/e2e/morphing-dialog.spec.ts --headed
```

### 3. Review Failures

When tests fail:

1. **Check videos** in `test-results/` - See blinks in slow motion
2. **Open trace viewer**: `bunx playwright show-trace test-results/path-to-trace.zip`
3. **View HTML report**: `bun run test:report`

### 4. Fix Issues

Based on test results:

**Fix 1: AnimatedThemeToggler**
- Remove `flushSync` from View Transition callback
- Debounce MutationObserver

**Fix 2: Card3D RAF**
- Add Intersection Observer to stop RAF when not visible
- Use `useInView` hook from framer-motion

**Fix 3: Dock**
- Debounce mousemove events
- Only track when dock is hovered

**Fix 4: MorphingDialog**
- Replace body class toggle with data attribute
- Combine useEffect hooks
- Use useLayoutEffect for focus management

**Fix 5: Font Preloading**
- Add `<link rel="preload">` for DM Sans in layout.tsx

## Configuration

See `playwright.config.ts` for:

- **WebServer**: Auto-starts Next.js on localhost:3000
- **Video**: Records on failure
- **Trace**: Captures on first retry
- **Projects**: chromium-light, chromium-dark, mobile-safari, mobile-chrome
- **Timeouts**: 30s per test (motion-heavy components)

## Anti-Flake Strategies

Motion-heavy components require special handling:

1. ✅ `reducedMotion: 'reduce'` in config
2. ✅ `disableAnimations()` helper for visual regression
3. ✅ `waitForMotionAnimations()` instead of arbitrary timeouts
4. ✅ `networkidle` wait state for hydration tests
5. ✅ 30s timeouts for animation-heavy tests
6. ✅ Auto-waiting: `locator.click()` instead of `waitForTimeout + click`

## Custom Fixtures

Located in `tests/fixtures/index.ts`:

```typescript
// Auto-navigate and wait for hydration
test('my test', async ({ hydrated }) => {
  // Page is already navigated and hydrated
});

// Disable all animations
test('visual test', async ({ noAnimations }) => {
  // Animations are disabled
});
```

## Continuous Integration

To run in CI (GitHub Actions):

```yaml
- name: Install Playwright
  run: bunx playwright install --with-deps chromium

- name: Run Playwright tests
  run: bun run test
  env:
    CI: true

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Tips

- **Use UI mode** (`bun run test:ui`) for interactive debugging
- **Check videos** when tests fail - they show blinks in slow motion
- **Use trace viewer** to inspect frame-by-frame DOM changes
- **Run tests in headed mode** to see what's happening
- **Update snapshots** with `--update-snapshots` when design changes

## Next Steps

After fixing blinks and tests pass:

1. Expand test coverage (work, education, projects, contact sections)
2. Add accessibility tests with `@axe-core/playwright`
3. Add performance tests (LCP, FID, CLS)
4. Test individual components in isolation
5. Set up CI/CD integration

## Resources

- [Playwright Docs](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Debugging Tests](https://playwright.dev/docs/debug)
