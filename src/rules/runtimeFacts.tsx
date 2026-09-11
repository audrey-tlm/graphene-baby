import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type ReactNode } from 'react';

import type { RegisteredComponent } from './config/componentRegistry';
import type { RegisteredPattern } from './config/patternRegistry';
import type { SpacingRelationship } from './config/spacing';

export interface ActionGroupFact {
  readonly kind: 'action-group';
  readonly primaryCount: number;
  /** Whether a `secondary` action was actually provided — distinct from `secondaryVariant` being unset. */
  readonly hasSecondary: boolean;
  /** Button `variant` read off the `primary` element; undefined means Button's own default ('default', solid). */
  readonly primaryVariant?: string;
  /** Button `variant` read off the `secondary` element, when present. */
  readonly secondaryVariant?: string;
  readonly overflowCount: number;
  /** A `variant: 'destructive'` overflow item with no `separatorBefore` — not visually set apart from the rest. */
  readonly overflowHasUnseparatedDestructive: boolean;
}

export interface PageHeaderFact {
  readonly kind: 'page-header';
}

export interface HeadingFact {
  readonly kind: 'heading';
  readonly level: 1 | 2 | 3;
}

/** Declared by `<Section>` (Guardrail 2). `sectionKey` is an auto-generated identity, not authored. */
export interface SectionFact {
  readonly kind: 'section';
  readonly sectionKey: string;
  /** The name a `<FocalPoint>` inside this section must declare to satisfy it. */
  readonly focalPoint: string;
}

/** Declared by `<FocalPoint>` (Guardrail 2). `sectionKey` is read from the nearest enclosing `<Section>` via context. */
export interface FocalPointFact {
  readonly kind: 'focal-point';
  readonly name: string;
  readonly sectionKey: string;
}

/** Declared by `<ContentText>` (Guardrail 1). `sectionKey` scopes the strength-ordering check to one `<Section>` at a time. */
export interface ContentRoleFact {
  readonly kind: 'content-role';
  readonly role: 'primary' | 'secondary' | 'metadata';
  readonly className: string;
  readonly sectionKey: string;
}

/** Declared by `<Status>` (Guardrail 5). */
export interface StatusFact {
  readonly kind: 'status';
  readonly status: string;
  readonly hasLabel: boolean;
  readonly hasIcon: boolean;
}

/** Declared by `<Stack>` (Guardrail 3). */
export interface SpacingFact {
  readonly kind: 'spacing';
  readonly relationship: SpacingRelationship;
  readonly gapClassName: string;
}

/** Declared by `<DeclaredIntent>` (Guardrails 4b & 6). `component` is typed against COMPONENT_REGISTRY's keys; `intent` is a free string so a real mismatch can be authored and caught. */
export interface ComponentIntentFact {
  readonly kind: 'component-intent';
  readonly component: RegisteredComponent;
  readonly intent: string;
}

/** Declared by `<PatternException>` (Guardrail 7). `pattern` is typed against PATTERN_REGISTRY's keys. */
export interface PatternExceptionFact {
  readonly kind: 'pattern-exception';
  readonly pattern: RegisteredPattern;
  readonly reason: string;
}

export type GuardrailFact =
  | ActionGroupFact
  | PageHeaderFact
  | HeadingFact
  | SectionFact
  | FocalPointFact
  | ContentRoleFact
  | StatusFact
  | SpacingFact
  | ComponentIntentFact
  | PatternExceptionFact;

/** Key used for facts declared outside any `<Section>` — grouped together rather than dropped. */
export const NO_SECTION_KEY = '(no section)';

const SectionKeyContext = createContext<string>(NO_SECTION_KEY);

/** `<Section>` provides its identity here; `<FocalPoint>`/`<ContentText>` read it to scope their own facts. */
export const SectionKeyProvider = SectionKeyContext.Provider;

export function useSectionKey(): string {
  return useContext(SectionKeyContext);
}

interface FactsContextValue {
  register(id: string, fact: GuardrailFact): void;
  unregister(id: string): void;
  facts: readonly GuardrailFact[];
}

const FactsContext = createContext<FactsContextValue | null>(null);

/**
 * Collects facts pushed by guardrail-enforcing components (ActionGroup,
 * PageHeader) as they render, so hierarchy rules can evaluate the page that
 * actually rendered instead of trusting each component in isolation.
 * Re-mount per example page (see App.tsx) so facts don't leak between pages.
 */
export function GuardrailFactsProvider({ children }: { children: ReactNode }) {
  const [factMap, setFactMap] = useState<Record<string, GuardrailFact>>({});

  // Stable identities (functional setState form), so registering a fact
  // never itself invalidates the effect dependency in useRegisterGuardrailFact
  // below — only a change to that component's own fact does.
  const register = useCallback((id: string, fact: GuardrailFact) => {
    setFactMap((prev) => ({ ...prev, [id]: fact }));
  }, []);
  const unregister = useCallback((id: string) => {
    setFactMap((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const facts = useMemo(() => Object.values(factMap), [factMap]);
  const value = useMemo<FactsContextValue>(() => ({ register, unregister, facts }), [register, unregister, facts]);

  return <FactsContext.Provider value={value}>{children}</FactsContext.Provider>;
}

export function useGuardrailFacts(): readonly GuardrailFact[] {
  const ctx = useContext(FactsContext);
  if (!ctx) throw new Error('useGuardrailFacts must be used within a GuardrailFactsProvider');
  return ctx.facts;
}

/** Registers `fact` for the calling component's lifetime; removed on unmount. */
export function useRegisterGuardrailFact(fact: GuardrailFact): void {
  const ctx = useContext(FactsContext);
  const id = useId();
  const factKey = JSON.stringify(fact);
  useEffect(() => {
    if (!ctx) return;
    ctx.register(id, JSON.parse(factKey));
    return () => ctx.unregister(id);
    // factKey captures fact's value; ctx.register/unregister are stable (see provider).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.register, ctx?.unregister, id, factKey]);
}
