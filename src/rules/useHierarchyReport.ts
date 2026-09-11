import { useMemo } from 'react';

import { ALL_HIERARCHY_RULES, THEME_RULES, evaluateRules } from './registry';
import { useGuardrailFacts } from './runtimeFacts';
import type { RuleResult } from './types';
import type { ContrastResult } from '../theme/contrast';

/**
 * Evaluates hierarchy + design-system rules against whatever the currently-mounted
 * page reported, plus theme-token rules against the theme's currently-resolved
 * colors (see THEME_RULES — these check resolved values, not declarations).
 */
export function useHierarchyReport(contrastResults: readonly ContrastResult[]): readonly RuleResult[] {
  const facts = useGuardrailFacts();
  return useMemo(
    () => [...evaluateRules(ALL_HIERARCHY_RULES, facts), ...evaluateRules(THEME_RULES, contrastResults)],
    [facts, contrastResults],
  );
}
