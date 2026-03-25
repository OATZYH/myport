# Playwright Testing Setup - Complete ✅

## Installation Status

✅ **Playwright installed**: v1.58.2
✅ **Chromium browser**: Installed
✅ **Configuration**: `playwright.config.ts` created
✅ **Test suite**: 7 test files with 60+ tests
✅ **Helper utilities**: 4 helper modules
✅ **Custom fixtures**: Created
✅ **Type definitions**: Window interface extensions
✅ **Scripts**: Added to package.json
✅ **Gitignore**: Updated

## Quick Start

```bash
# 1. Run all tests (auto-starts Next.js dev server)
bun run test

# 2. Run critical blink tests
bunx playwright test tests/e2e/theme-toggle.spec.ts --headed
bunx playwright test tests/e2e/card3d.spec.ts --headed
bunx playwright test tests/e2e/morphing-dialog.spec.ts --headed

# 3. Generate baseline screenshots
bunx playwright test visual-regression.spec.ts --update-snapshots

# 4. View results in UI mode
bun run test:ui
```

## What Was Created

### Configuration Files

- **`playwright.config.ts`** - Main configuration
  - Auto-starts Next.js on localhost:3000
  - Records videos on failure
  - Captures traces on retry
  - Tests light/dark themes
  - Mobile and desktop viewports

### Test Files (`tests/e2e/`)

1. **`theme-toggle.spec.ts`** ⭐ - 7 tests
   - Detects excessive DOM mutations (MutationObserver loops)
   - Checks for flushSync warnings
   - Measures layout shift during theme toggle
   - Visual regression for light/dark modes

2. **`card3d.spec.ts`** ⭐ - 6 tests
   - **EXPECTED TO FAIL**: RAF doesn't stop when out of view
   - Detects continuous requestAnimationFrame loops
   - Checks for Intersection Observer implementation
   - Frame rate performance testing

3. **`morphing-dialog.spec.ts`** ⭐ - 10 tests
   - Portal rendering layout shift detection
   - AnimatePresence flicker detection
   - Focus management reflow tracking
   - Body class toggle monitoring
   - Accessibility tests (focus trap, focus restore)

4. **`hydration.spec.ts`** - 11 tests
   - React 19 hydration error detection
   - Theme provider initialization
   - suppressHydrationWarning usage
   - Font loading during hydration
   - CLS measurement

5. **`dock.spec.ts`** - 7 tests
   - Mouse tracking performance
   - Spring animation frame drops
   - Motion value update frequency
   - Hover state animations

6. **`font-loading.spec.ts`** - 9 tests
   - DM Sans preloading detection
   - font-display: swap verification
   - FOUC (Flash of Unstyled Content) detection
   - Layout shift measurement
   - Font caching verification

7. **`visual-regression.spec.ts`** - 15+ tests
   - Full-page screenshots (light/dark)
   - Component screenshots (dock, photo cards, theme button)
   - Section screenshots (work, education, projects, contact)
   - Mobile screenshots

### Helper Utilities (`tests/helpers/`)

1. **`wait-for-hydration.ts`**
   - `waitForHydration()` - Waits for React + theme + fonts
   - `detectHydrationMismatch()` - Catches console errors
   - `measureLayoutShift()` - CLS calculation
   - `findSuppressedHydrationElements()` - Audits suppressHydrationWarning

2. **`wait-for-animations.ts`**
   - `waitForMotionAnimations()` - Waits for framer-motion
   - `disableAnimations()` - CSS to disable all animations
   - `cancelRAFLoops()` - Stops requestAnimationFrame
   - `countActiveRAFLoops()` - Counts RAF callbacks
   - `detectViewTransitionMutations()` - Mutation counting
   - `detectContinuousSpringAnimations()` - Detects excessive updates

3. **`theme-helpers.ts`**
   - `toggleTheme()` - Clicks button, waits for View Transition
   - `getCurrentTheme()` - Returns 'light' | 'dark'
   - `setThemeWithoutAnimation()` - Direct theme change
   - `countThemeToggleMutations()` - Mutation counting
   - `detectFlushSyncWarnings()` - Console monitoring
   - `measureThemeToggleLayoutShift()` - CLS during toggle

4. **`visual-compare.ts`**
   - `captureBeforeAfterScreenshots()` - Before/after comparison
   - `detectVisualBlink()` - Rapid screenshot comparison
   - `takeStableScreenshot()` - Anti-flake screenshot
   - `waitForElementToStopMoving()` - Animation settling

### Custom Fixtures (`tests/fixtures/`)

- **`hydrated`** - Auto-navigates and waits for hydration
- **`noAnimations`** - Disables animations for stable testing

### Type Definitions (`tests/types/`)

- **`window.d.ts`** - Window interface extensions for custom properties

## Expected Test Results

| Test | Status | Notes |
|------|--------|-------|
| ✅ Hydration Tests | PASS | Should all pass |
| ⚠️ Theme Toggle | MAY FAIL | Check mutation count < 50 |
| ❌ Card3D RAF | **WILL FAIL** | Confirmed bug - RAF doesn't stop |
| ⚠️ Dock | MAY FAIL | Check motion value updates |
| ⚠️ MorphingDialog | MAY FAIL | Portal/focus layout shifts |
| ⚠️ Font Loading | MAY FAIL | DM Sans may not be preloaded |
| ✅ Visual Regression | PASS | After baselines generated |

**These failures are intentional** - they confirm the tests are catching real blink issues!

## Debugging Workflow

### Step 1: Run Critical Tests

```bash
# Start with theme toggle (most likely to show issues)
bunx playwright test tests/e2e/theme-toggle.spec.ts --headed

# Check Card3D RAF bug
bunx playwright test tests/e2e/card3d.spec.ts --headed
```

### Step 2: Review Failures

When a test fails:

1. **Check the console output** - Shows which assertion failed
2. **Open `test-results/`** - Contains videos of failures
3. **View trace**: `bunx playwright show-trace test-results/path-to-trace.zip`
4. **Read the HTML report**: `bun run test:report`

### Step 3: Watch Videos in Slow Motion

Videos are recorded at normal speed but can reveal:
- Screen flashes/blinks
- Layout shifts
- Component jumping
- Theme transition issues

### Step 4: Use Trace Viewer

```bash
bunx playwright show-trace test-results/.../trace.zip
```

Shows:
- Frame-by-frame DOM snapshots
- Network requests
- Console logs
- Screenshots at each step

### Step 5: Debug Interactively

```bash
# UI mode - best for debugging
bun run test:ui

# Or debug mode with breakpoints
bun run test:debug
```

## Fixing the Blink Issues

Based on test failures, here's what to fix:

### Fix 1: AnimatedThemeToggler (theme-toggle.spec.ts failures)

**File**: `/Users/sarun/Github/myport/src/components/magicui/animated-theme-toggler.tsx`

Issues:
- `flushSync` inside View Transition callback
- MutationObserver causing render loops

Solution:
```typescript
// Remove flushSync, use startTransition instead
startTransition(() => {
  setTheme(newTheme);
});

// Debounce MutationObserver
const debouncedObserver = useMemo(() =>
  debounce((mutations) => {
    // handle mutations
  }, 100),
  []
);
```

### Fix 2: Card3D RAF (card3d.spec.ts failures)

**File**: `/Users/sarun/Github/myport/src/components/section/photo-card-section.tsx`

Issue:
- requestAnimationFrame runs continuously even when scrolled out of view

Solution:
```typescript
import { useInView } from 'framer-motion';

const ref = useRef(null);
const isInView = useInView(ref);

useEffect(() => {
  if (!isInView) return; // Stop RAF when not visible

  let rafId;
  const animate = () => {
    // animation logic
    rafId = requestAnimationFrame(animate);
  };

  rafId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(rafId);
}, [isInView]);
```

### Fix 3: MorphingDialog (morphing-dialog.spec.ts failures)

**File**: `/Users/sarun/Github/myport/src/components/ui/morphing-dialog.tsx`

Issues:
- Body class toggle causes layout shift
- Multiple useEffect hooks causing re-renders
- Focus management DOM queries cause reflows

Solution:
```typescript
// Replace body class with data attribute (no layout shift)
useLayoutEffect(() => {
  if (open) {
    document.body.dataset.dialogOpen = 'true';
  } else {
    delete document.body.dataset.dialogOpen;
  }
}, [open]);

// Combine useEffect hooks
useLayoutEffect(() => {
  if (!open) return;

  // Focus management
  const previouslyFocused = document.activeElement;

  // Single useLayoutEffect prevents multiple reflows

  return () => {
    previouslyFocused?.focus();
  };
}, [open]);
```

### Fix 4: Dock (dock.spec.ts failures)

**File**: `/Users/sarun/Github/myport/src/components/ui/dock.tsx`

Issue:
- Mouse tracking updates too frequently

Solution:
```typescript
import { useThrottle } from '@/hooks/use-throttle';

const handleMouseMove = useThrottle((e: MouseEvent) => {
  mouseX.set(e.pageX);
}, 16); // Throttle to ~60fps
```

### Fix 5: Font Preloading (font-loading.spec.ts failures)

**File**: `/Users/sarun/Github/myport/src/app/layout.tsx`

Issue:
- DM Sans not preloaded, causing FOUC

Solution:
```tsx
<head>
  <link
    rel="preload"
    href="/fonts/dm-sans.woff2"
    as="font"
    type="font/woff2"
    crossOrigin="anonymous"
  />
</head>
```

## Next Steps

### 1. Run All Tests

```bash
bun run test
```

### 2. Fix Failures One by One

Start with the confirmed bugs:
1. Card3D RAF (definitely broken)
2. Theme toggle mutations
3. MorphingDialog layout shifts

### 3. Re-run Tests After Fixes

```bash
# Re-run specific test after fixing
bunx playwright test tests/e2e/card3d.spec.ts

# Re-run all tests
bun run test
```

### 4. Update Baselines

After fixing visual issues:

```bash
bunx playwright test visual-regression.spec.ts --update-snapshots
```

### 5. Expand Coverage

Once blinks are fixed:
- Add more component tests
- Add accessibility tests (`@axe-core/playwright`)
- Add performance tests (Web Vitals)
- Set up CI/CD

## CI/CD Integration

Add to `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Install Playwright
        run: bunx playwright install --with-deps chromium

      - name: Run tests
        run: bun run test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Useful Commands

```bash
# Run tests
bun run test                 # All tests
bun run test:ui              # Interactive UI mode
bun run test:headed          # Show browser
bun run test:debug           # Debug mode with breakpoints
bun run test:report          # View HTML report

# Run specific tests
bunx playwright test theme-toggle.spec.ts
bunx playwright test --grep "Card3D"
bunx playwright test --project=chromium-dark

# Update screenshots
bunx playwright test --update-snapshots

# Code generation
bun run test:codegen         # Record actions
```

## Troubleshooting

### Tests timeout

- Increase timeout in `playwright.config.ts`
- Check if Next.js dev server is running
- Look for infinite animation loops

### Screenshots don't match

- Run `--update-snapshots` to regenerate baselines
- Check if animations are disabled
- Verify theme is set correctly

### Videos not recording

- Check `playwright.config.ts` has `video: 'retain-on-failure'`
- Look in `test-results/` directory
- Videos only record on failures

### WebServer not starting

- Ensure port 3000 is free
- Check `bun run dev` works manually
- Look at stderr output in test results

## Resources

- **Documentation**: `tests/README.md`
- **Playwright Docs**: https://playwright.dev
- **Test Results**: `test-results/`
- **HTML Report**: Run `bun run test:report`

---

**Status**: ✅ Ready to run tests and debug blink issues!

Run `bun run test` to start testing.
