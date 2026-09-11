import type { ResolvedTheme } from '@gravitee/graphene-core';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { THEME_TOKENS } from './tokenSchema.generated';

/** A token's override, independently per resolved theme. Absent = use Graphene's own default for that mode. */
export interface TokenOverride {
  readonly light?: string;
  readonly dark?: string;
}

/** Token name -> per-mode hex override. A token missing entirely, or missing one mode, falls back to Graphene's default for that mode. */
export type ThemeOverrides = Readonly<Record<string, TokenOverride>>;

interface ThemeConfigContextValue {
  readonly draft: ThemeOverrides;
  readonly committed: ThemeOverrides;
  readonly isDirty: boolean;
  setTokenValue(tokenName: string, mode: ResolvedTheme, hexValue: string): void;
  resetToken(tokenName: string, mode: ResolvedTheme): void;
  /** Clears only the currently-resolved mode's overrides — the other mode's colors are untouched. */
  resetAll(mode: ResolvedTheme): void;
  /** Commits the draft (both modes, whatever's been edited so far) as the saved theme. Callers are responsible for gating this on the guardrail report. */
  commit(): void;
  /**
   * Clears the draft AND the saved theme (committed state + localStorage) for BOTH
   * modes, restoring Graphene's original colors immediately — unlike `resetAll`, which
   * only resets one mode's live preview and leaves everything else (including a
   * previously-saved theme) intact until something else is committed. Not gated on the
   * guardrail report: it can always run, including as the way out of a saved theme
   * that's failing checks.
   */
  resetToGrapheneDefaults(): void;
}

const ThemeConfigContext = createContext<ThemeConfigContextValue | null>(null);

const STORAGE_KEY = 'gamma-pretty.theme-overrides.v2';

function loadPersisted(): ThemeOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ThemeOverrides) : {};
  } catch {
    return {};
  }
}

/**
 * Pure state (draft/committed overrides) — deliberately does NOT read
 * useTheme()/resolvedTheme or touch the DOM itself. This component sits as
 * ThemeProvider's direct child, and empirically (verified with render-level
 * logging) a component in that exact position does not reliably re-render
 * when ThemeProvider's own context value changes, even though it calls
 * useTheme() directly — while a deeply-nested consumer (ThemeSettingsPanel)
 * always does. Applying the draft to the DOM therefore lives in
 * ThemeSettingsPanel instead (see useApplyThemeDraft below), which is
 * guaranteed to be mounted and to see every mode change.
 */
export function ThemeConfigProvider({ children }: { readonly children: ReactNode }) {
  const [committed, setCommitted] = useState<ThemeOverrides>(() => loadPersisted());
  const [draft, setDraft] = useState<ThemeOverrides>(committed);

  const setTokenValue = useCallback((tokenName: string, mode: ResolvedTheme, hexValue: string) => {
    setDraft((prev) => ({ ...prev, [tokenName]: { ...prev[tokenName], [mode]: hexValue } }));
  }, []);

  const resetToken = useCallback((tokenName: string, mode: ResolvedTheme) => {
    setDraft((prev) => {
      if (prev[tokenName]?.[mode] === undefined) return prev;
      const nextToken = { ...prev[tokenName] };
      delete nextToken[mode];
      const next = { ...prev, [tokenName]: nextToken };
      if (Object.keys(nextToken).length === 0) delete next[tokenName];
      return next;
    });
  }, []);

  const resetAll = useCallback((mode: ResolvedTheme) => {
    setDraft((prev) => {
      const next: Record<string, TokenOverride> = {};
      for (const [tokenName, override] of Object.entries(prev)) {
        const rest = { ...override };
        delete rest[mode];
        if (Object.keys(rest).length > 0) next[tokenName] = rest;
      }
      return next;
    });
  }, []);

  const commit = useCallback(() => {
    setCommitted(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const resetToGrapheneDefaults = useCallback(() => {
    setDraft({});
    setCommitted({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(committed), [draft, committed]);

  const value = useMemo<ThemeConfigContextValue>(
    () => ({ draft, committed, isDirty, setTokenValue, resetToken, resetAll, commit, resetToGrapheneDefaults }),
    [draft, committed, isDirty, setTokenValue, resetToken, resetAll, commit, resetToGrapheneDefaults],
  );

  return <ThemeConfigContext.Provider value={value}>{children}</ThemeConfigContext.Provider>;
}

export function useThemeConfig(): ThemeConfigContextValue {
  const ctx = useContext(ThemeConfigContext);
  if (!ctx) throw new Error('useThemeConfig must be used within a ThemeConfigProvider');
  return ctx;
}

/**
 * Applies `draft` live as inline custom properties on <html> for the given
 * resolved mode, so every Graphene component re-renders its colors instantly
 * via the normal CSS cascade. Inline styles win over both the light (:root)
 * and .dark class rules, so this must pick the value for whichever mode is
 * currently resolved — re-running on resolvedTheme change is what keeps a
 * light-only override from bleeding into dark (or vice versa) when the mode
 * switches. Called from ThemeSettingsPanel rather than from
 * ThemeConfigProvider itself — see the comment on ThemeConfigProvider above.
 */
export function useApplyThemeDraft(draft: ThemeOverrides, resolvedTheme: ResolvedTheme): void {
  useEffect(() => {
    const root = document.documentElement;
    for (const token of THEME_TOKENS) {
      const value = draft[token.name]?.[resolvedTheme];
      if (value) {
        root.style.setProperty(`--${token.name}`, value);
      } else {
        root.style.removeProperty(`--${token.name}`);
      }
    }
  }, [draft, resolvedTheme]);
}
