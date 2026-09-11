import { describe, expect, it } from 'vitest';

import { contrastRatio, parseRgb, relativeLuminance, rgbToHex } from './color';

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('is 21:1 for black on white (WCAG maximum)', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 1);
  });

  it('is 1:1 for identical colors', () => {
    const gray = { r: 128, g: 128, b: 128 };
    expect(contrastRatio(gray, gray)).toBeCloseTo(1, 5);
  });

  it('is symmetric regardless of argument order', () => {
    const a = { r: 20, g: 30, b: 40 };
    const b = { r: 200, g: 210, b: 220 };
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
  });

  it('matches an independently-computed ratio for a real Graphene dark-mode pair', () => {
    // --destructive (#ff6468) vs --destructive-foreground (#ffffff) in dark mode —
    // found failing via the running app; verified by hand against the WCAG formula.
    const ratio = contrastRatio({ r: 255, g: 100, b: 104 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeCloseTo(2.89, 1);
  });
});

describe('app.css contrast fixes (Muted, Success)', () => {
  // Graphene defaults fail WCAG AA here; app.css overrides them via
  // `html:root` / `html.dark` (higher specificity than Graphene's own
  // `:root` / `.dark`, so they win regardless of import order — see
  // main.tsx, which loads `@gravitee/graphene-core/styles` last).
  it('light muted-foreground (oklch(54% .013 55)) passes against muted (stone-100)', () => {
    // Default stone-500 (#79716b) on stone-100 (#f7f5f3) was 4.40:1 — just under AA.
    const bg = parseRgb('#f7f5f3');
    const fixedForeground = parseRgb('#756d68');
    expect(contrastRatio(bg, fixedForeground)).toBeGreaterThanOrEqual(4.5);
  });

  it('success (oklch(54% .15 149)) passes against white in both light and dark mode', () => {
    // Defaults were 3.22:1 (light, green-600) and 2.24:1 (dark, green-500) — both fail.
    // The same darkened, gamut-clamped green clears AA for both.
    const fixedBackground = parseRgb('#088539');
    const white = parseRgb('#ffffff');
    expect(contrastRatio(fixedBackground, white)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('rgbToHex / parseRgb', () => {
  it('round-trips', () => {
    const rgb = { r: 18, g: 52, b: 86 };
    expect(parseRgb(rgbToHex(rgb))).toEqual(rgb);
  });

  it('pads single-digit hex components', () => {
    expect(rgbToHex({ r: 0, g: 5, b: 255 })).toBe('#0005ff');
  });
});
