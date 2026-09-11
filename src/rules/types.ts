export type RuleCategory = 'accessibility' | 'hierarchy' | 'design-system';
export type RuleEnforcement = 'runtime' | 'static';

/**
 * 'pass' — confidently verified compliant.
 * 'warning' — not a confirmed violation, but flagged for review (a soft heuristic
 * threshold, e.g. an overflow menu that's grown suspiciously long). Never blocks
 * saving a theme.
 * 'violation' — confidently verified non-compliant. Blocks saving.
 * 'exempted' — a declared deviation from a registered pattern (Guardrail 7),
 * with a documented reason. Distinct from 'pass' (it didn't reuse the pattern)
 * and from 'violation' (the deviation was acknowledged, not silent). Never blocks
 * saving; an exception with no reason is a 'violation', not 'exempted'.
 */
export type RuleStatus = 'pass' | 'warning' | 'violation' | 'exempted';

export interface RuleResult {
  readonly ruleId: string;
  readonly status: RuleStatus;
  readonly detail: string;
}

export interface Rule<Facts> {
  readonly id: string;
  readonly category: RuleCategory;
  readonly description: string;
  /**
   * 'runtime' — evaluated against facts components actually reported as they rendered.
   * 'static' — enforced by the type system or component API instead; `evaluate` still
   * runs (ignoring `facts`) so the panel can show it as a confirmed pass, not just list it.
   *
   * Only rules this system can actually verify belong here — a design judgment call
   * (e.g. "is there one clear primary section?") that no fact-collection could answer
   * was deliberately left out rather than faked as an always-warning placeholder.
   */
  readonly enforcement: RuleEnforcement;
  readonly evaluate: (facts: Facts) => readonly RuleResult[];
}
