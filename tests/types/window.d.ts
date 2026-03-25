/**
 * Type declarations for custom window properties used in tests
 */

declare global {
  interface Window {
    // CLS tracking
    __CLS_SCORE__?: number;
    __DIALOG_CLS__?: number;
    __THEME_CLS__?: number;
    __FONT_CLS__?: number;

    // Font loading
    __FONT_LOAD_TIME__?: number;
    __FIRST_PAINT__?: number;
  }

  interface Element {
    // Position tracking
    __lastRect__?: DOMRect;
    // Intersection observer
    __intersectionObserver__?: IntersectionObserver;
  }
}

export {};
