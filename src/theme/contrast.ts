import { useEffect, useState } from 'react';

import { contrastRatio, parseRgb, resolveTokenColor, WCAG_AA_TEXT_THRESHOLD } from './color';
import { CONTRAST_PAIRS, type ContrastPair } from './tokenSchema.generated';

export interface ContrastResult {
  readonly pair: ContrastPair;
  readonly backgroundHex: string;
  readonly foregroundHex: string;
  readonly ratio: number;
  readonly threshold: number;
  readonly pass: boolean;
}

/**
 * Resolves each pair's colors once and derives both the displayed hex and
 * the contrast ratio from that single read, so the settings panel's swatches
 * and its pass/fail badge can never disagree with each other.
 */
export function evaluateContrast(pairs: readonly ContrastPair[] = CONTRAST_PAIRS): ContrastResult[] {
  const root = document.documentElement;
  return pairs.map((pair) => {
    const backgroundHex = resolveTokenColor(pair.background, root);
    const foregroundHex = resolveTokenColor(pair.foreground, root);
    const ratio = contrastRatio(parseRgb(backgroundHex), parseRgb(foregroundHex));
    return {
      pair,
      backgroundHex,
      foregroundHex,
      ratio,
      threshold: WCAG_AA_TEXT_THRESHOLD,
      pass: ratio >= WCAG_AA_TEXT_THRESHOLD,
    };
  });
}

/**
 * Re-evaluates contrast for `pairs` whenever `dependency` changes (pass the
 * theme draft). Deferred to the next animation frame so it reads colors
 * after the browser has recalculated styles from the newly-applied
 * CSS custom properties, regardless of effect ordering between components.
 */
export function useContrastReport(
  dependency: unknown,
  pairs: readonly ContrastPair[] = CONTRAST_PAIRS,
): ContrastResult[] {
  const [results, setResults] = useState<ContrastResult[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setResults(evaluateContrast(pairs)));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency, pairs]);

  return results;
}
