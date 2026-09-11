/**
 * Resolves a CSS custom property to a concrete color, and computes WCAG
 * contrast between two colors.
 *
 * Graphene's primitive tokens are authored in OKLCH, and some semantic
 * tokens use color-mix(). Rather than re-implementing OKLCH/color-mix
 * parsing, we let the browser do it: assign the property to a probe
 * element's `color`, read the resolved value via getComputedStyle (which
 * evaluates var()/color-mix()), then normalize it through a <canvas> 2D
 * context, which the HTML spec requires to parse any valid CSS color and
 * serialize it back out as '#rrggbb' (opaque) or 'rgba(...)'.
 */

export interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

let probeEl: HTMLDivElement | null = null;
let canvasCtx: CanvasRenderingContext2D | null = null;

function getProbeElement(container: HTMLElement): HTMLDivElement {
  if (!probeEl) {
    probeEl = document.createElement('div');
    probeEl.style.position = 'absolute';
    probeEl.style.visibility = 'hidden';
    probeEl.style.pointerEvents = 'none';
    // Graphene applies a broad `transition: all` (for smooth light/dark
    // switching) that a plain <div> inherits from a universal selector.
    // Without this, reading the probe's color right after a token change
    // can catch a mid-transition interpolated value instead of the target.
    probeEl.style.transition = 'none';
  }
  if (probeEl.parentElement !== container) {
    container.appendChild(probeEl);
  }
  return probeEl;
}

function getCanvasCtx(): CanvasRenderingContext2D {
  if (!canvasCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    canvasCtx = ctx;
  }
  return canvasCtx;
}

/**
 * Rasterizes any valid CSS color to concrete 8-bit sRGB by painting it and
 * reading the pixel back, rather than parsing canvas's `fillStyle` getter as
 * a string — modern Chrome preserves wide-gamut input (e.g. keeps
 * `oklch(...)` as `oklch(...)`) instead of always normalizing it to rgb/hex,
 * so string parsing is not reliable. Rasterized pixel data always comes back
 * as concrete 8-bit sRGB regardless of how the color was specified.
 */
export function cssColorToRgb(cssColor: string): RGB {
  const ctx = getCanvasCtx();
  ctx.clearRect(0, 0, 1, 1); // avoid alpha-compositing a translucent color onto the previous pixel
  ctx.fillStyle = '#000000'; // reset, so an invalid input can't silently reuse the previous color
  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return { r, g, b };
}

function toHex2(n: number): string {
  return n.toString(16).padStart(2, '0');
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

export function parseRgb(hex: string): RGB {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/** Resolves a `--token-name` custom property (as currently in effect on `container`) to a hex string. */
export function resolveTokenColor(tokenName: string, container: HTMLElement): string {
  const probe = getProbeElement(container);
  probe.style.color = `var(--${tokenName})`;
  const resolved = getComputedStyle(probe).color;
  return rgbToHex(cssColorToRgb(resolved));
}

/** WCAG relative luminance, per https://www.w3.org/TR/WCAG21/#dfn-relative-luminance */
export function relativeLuminance({ r, g, b }: RGB): number {
  const linearize = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [linearize(r), linearize(g), linearize(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG contrast ratio between two colors, in the range [1, 21]. */
export function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export const WCAG_AA_TEXT_THRESHOLD = 4.5;
export const WCAG_AA_LARGE_TEXT_THRESHOLD = 3;
