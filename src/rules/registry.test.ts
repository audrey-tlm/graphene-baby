import { describe, expect, it } from 'vitest';

import { DESIGN_SYSTEM_RULES, evaluateRules, HIERARCHY_RULES, THEME_RULES } from './registry';
import type { ActionGroupFact, GuardrailFact } from './runtimeFacts';
import type { ContrastResult } from '../theme/contrast';

function contrastResult(id: string, label: string, backgroundHex: string): ContrastResult {
  return {
    pair: { id, label, background: id, foreground: `${id}-foreground`, isCore: true },
    backgroundHex,
    foregroundHex: '#ffffff',
    ratio: 10,
    threshold: 4.5,
    pass: true,
  };
}

const baseActionGroup: ActionGroupFact = {
  kind: 'action-group',
  primaryCount: 1,
  hasSecondary: false,
  overflowCount: 0,
  overflowHasUnseparatedDestructive: false,
};

describe('hierarchy.single-h1', () => {
  it('passes with exactly one page-header fact', () => {
    const facts: GuardrailFact[] = [{ kind: 'page-header' }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.single-h1');
    expect(result.status).toBe('pass');
  });

  it('is a violation with zero page-header facts', () => {
    const [result] = evaluateRules(HIERARCHY_RULES, []).filter((r) => r.ruleId === 'hierarchy.single-h1');
    expect(result.status).toBe('violation');
  });

  it('is a violation with more than one page-header fact', () => {
    const facts: GuardrailFact[] = [{ kind: 'page-header' }, { kind: 'page-header' }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.single-h1');
    expect(result.status).toBe('violation');
  });
});

describe('hierarchy.max-two-header-actions', () => {
  it('always passes — enforced by ActionGroup’s types, not runtime facts', () => {
    const [result] = evaluateRules(HIERARCHY_RULES, []).filter((r) => r.ruleId === 'hierarchy.max-two-header-actions');
    expect(result.status).toBe('pass');
  });
});

describe('hierarchy.primary-stronger-emphasis', () => {
  it('passes when there is no secondary action to compare against', () => {
    const facts: GuardrailFact[] = [{ ...baseActionGroup, hasSecondary: false }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.primary-stronger-emphasis',
    );
    expect(result.status).toBe('pass');
  });

  it('passes when secondary uses a subdued variant distinct from primary', () => {
    const facts: GuardrailFact[] = [
      { ...baseActionGroup, hasSecondary: true, primaryVariant: undefined, secondaryVariant: 'outline' },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.primary-stronger-emphasis',
    );
    expect(result.status).toBe('pass');
  });

  it('is a violation when secondary matches primary’s solid emphasis', () => {
    const facts: GuardrailFact[] = [{ ...baseActionGroup, hasSecondary: true }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.primary-stronger-emphasis',
    );
    expect(result.status).toBe('violation');
  });
});

describe('hierarchy.destructive-not-primary-emphasis', () => {
  it('passes when nothing destructive is in the primary slot or unseparated in overflow', () => {
    const facts: GuardrailFact[] = [baseActionGroup];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.destructive-not-primary-emphasis',
    );
    expect(result.status).toBe('pass');
  });

  it('is a violation when the primary action is styled destructive', () => {
    const facts: GuardrailFact[] = [{ ...baseActionGroup, primaryVariant: 'destructive' }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.destructive-not-primary-emphasis',
    );
    expect(result.status).toBe('violation');
  });

  it('is a violation when a destructive overflow item has no separator', () => {
    const facts: GuardrailFact[] = [{ ...baseActionGroup, overflowHasUnseparatedDestructive: true }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.destructive-not-primary-emphasis',
    );
    expect(result.status).toBe('violation');
  });
});

describe('hierarchy.heading-levels-no-skip', () => {
  it('passes with no headings reported yet', () => {
    const [result] = evaluateRules(HIERARCHY_RULES, []).filter((r) => r.ruleId === 'hierarchy.heading-levels-no-skip');
    expect(result.status).toBe('pass');
  });

  it('passes with H1 then H2, no gap', () => {
    const facts: GuardrailFact[] = [
      { kind: 'heading', level: 1 },
      { kind: 'heading', level: 2 },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.heading-levels-no-skip');
    expect(result.status).toBe('pass');
  });

  it('is a violation when H3 is used without an H2', () => {
    const facts: GuardrailFact[] = [
      { kind: 'heading', level: 1 },
      { kind: 'heading', level: 3 },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.heading-levels-no-skip');
    expect(result.status).toBe('violation');
  });
});

describe('hierarchy.overflow-not-overloaded', () => {
  it('passes with a short overflow menu', () => {
    const facts: GuardrailFact[] = [{ ...baseActionGroup, overflowCount: 3 }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.overflow-not-overloaded',
    );
    expect(result.status).toBe('pass');
  });

  it('warns (not violation) on a long overflow menu', () => {
    const facts: GuardrailFact[] = [{ ...baseActionGroup, overflowCount: 6 }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.overflow-not-overloaded',
    );
    expect(result.status).toBe('warning');
  });
});

describe('hierarchy.content-role-approved-treatment', () => {
  it('passes with an approved treatment', () => {
    const facts: GuardrailFact[] = [
      { kind: 'content-role', role: 'primary', className: 'text-2xl font-semibold text-foreground', sectionKey: 's1' },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.content-role-approved-treatment',
    );
    expect(result.status).toBe('pass');
  });

  it('is a violation with an unapproved className for the declared role', () => {
    const facts: GuardrailFact[] = [{ kind: 'content-role', role: 'metadata', className: 'text-3xl font-bold', sectionKey: 's1' }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.content-role-approved-treatment',
    );
    expect(result.status).toBe('violation');
  });
});

describe('hierarchy.content-role-strength-order', () => {
  it('passes when secondary is weaker than primary in the same section', () => {
    const facts: GuardrailFact[] = [
      { kind: 'content-role', role: 'primary', className: 'text-2xl font-semibold text-foreground', sectionKey: 's1' },
      { kind: 'content-role', role: 'metadata', className: 'text-xs text-muted-foreground', sectionKey: 's1' },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.content-role-strength-order',
    );
    expect(result.status).toBe('pass');
  });

  it('is a violation when secondary matches primary’s strength in the same section', () => {
    const facts: GuardrailFact[] = [
      { kind: 'content-role', role: 'primary', className: 'text-sm font-medium text-foreground', sectionKey: 's1' },
      { kind: 'content-role', role: 'secondary', className: 'text-sm text-foreground', sectionKey: 's1' },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.content-role-strength-order',
    );
    expect(result.status).toBe('violation');
  });

  it('does not compare across different sections', () => {
    const facts: GuardrailFact[] = [
      { kind: 'content-role', role: 'primary', className: 'text-sm font-medium text-foreground', sectionKey: 's1' },
      { kind: 'content-role', role: 'secondary', className: 'text-sm text-foreground', sectionKey: 's2' },
    ];
    const results = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.content-role-strength-order');
    expect(results.every((r) => r.status === 'pass')).toBe(true);
  });
});

describe('hierarchy.single-focal-point', () => {
  it('passes when exactly one matching FocalPoint is inside the Section', () => {
    const facts: GuardrailFact[] = [
      { kind: 'section', sectionKey: 's1', focalPoint: 'project-name' },
      { kind: 'focal-point', name: 'project-name', sectionKey: 's1' },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.single-focal-point');
    expect(result.status).toBe('pass');
  });

  it('is a violation when no FocalPoint is found inside the Section', () => {
    const facts: GuardrailFact[] = [{ kind: 'section', sectionKey: 's1', focalPoint: 'project-name' }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.single-focal-point');
    expect(result.status).toBe('violation');
  });

  it('is a violation with more than one FocalPoint in the same Section', () => {
    const facts: GuardrailFact[] = [
      { kind: 'section', sectionKey: 's1', focalPoint: 'project-name' },
      { kind: 'focal-point', name: 'project-name', sectionKey: 's1' },
      { kind: 'focal-point', name: 'status', sectionKey: 's1' },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.single-focal-point');
    expect(result.status).toBe('violation');
  });

  it('is a violation when the FocalPoint name does not match the Section’s declared focalPoint', () => {
    const facts: GuardrailFact[] = [
      { kind: 'section', sectionKey: 's1', focalPoint: 'project-name' },
      { kind: 'focal-point', name: 'wrong-name', sectionKey: 's1' },
    ];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.single-focal-point');
    expect(result.status).toBe('violation');
  });
});

describe('hierarchy.spacing-approved-token', () => {
  it('passes with an approved token for the declared relationship', () => {
    const facts: GuardrailFact[] = [{ kind: 'spacing', relationship: 'related', gapClassName: 'gap-1' }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.spacing-approved-token');
    expect(result.status).toBe('pass');
  });

  it('is a violation when the gap belongs to a different relationship’s scale', () => {
    // gap-8 is approved for "section", not "related".
    const facts: GuardrailFact[] = [{ kind: 'spacing', relationship: 'related', gapClassName: 'gap-8' }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.spacing-approved-token');
    expect(result.status).toBe('violation');
  });

  it('is a violation for an arbitrary, non-scale gap value', () => {
    const facts: GuardrailFact[] = [{ kind: 'spacing', relationship: 'group', gapClassName: 'gap-[13px]' }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter((r) => r.ruleId === 'hierarchy.spacing-approved-token');
    expect(result.status).toBe('violation');
  });
});

describe('hierarchy.status-non-color-indicator', () => {
  it('passes with a label', () => {
    const facts: GuardrailFact[] = [{ kind: 'status', status: 'success', hasLabel: true, hasIcon: false }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.status-non-color-indicator',
    );
    expect(result.status).toBe('pass');
  });

  it('passes with an icon and no label', () => {
    const facts: GuardrailFact[] = [{ kind: 'status', status: 'success', hasLabel: false, hasIcon: true }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.status-non-color-indicator',
    );
    expect(result.status).toBe('pass');
  });

  it('is a violation with neither a label nor an icon (only reachable by constructing the fact directly — Status’s own types prevent this)', () => {
    const facts: GuardrailFact[] = [{ kind: 'status', status: 'success', hasLabel: false, hasIcon: false }];
    const [result] = evaluateRules(HIERARCHY_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.status-non-color-indicator',
    );
    expect(result.status).toBe('violation');
  });
});

describe('hierarchy.component-intent-matches-registry', () => {
  it('passes when the declared intent is in the component’s registered intendedFor list', () => {
    const facts: GuardrailFact[] = [{ kind: 'component-intent', component: 'Button', intent: 'action' }];
    const [result] = evaluateRules(DESIGN_SYSTEM_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.component-intent-matches-registry',
    );
    expect(result.status).toBe('pass');
  });

  it('is a violation when the declared intent isn’t registered for that component', () => {
    // Button's registry entry is intendedFor: ['action'] — 'navigation' isn't in it.
    const facts: GuardrailFact[] = [{ kind: 'component-intent', component: 'Button', intent: 'navigation' }];
    const [result] = evaluateRules(DESIGN_SYSTEM_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.component-intent-matches-registry',
    );
    expect(result.status).toBe('violation');
  });

  it('passes when the intent matches one of several registered purposes', () => {
    const facts: GuardrailFact[] = [{ kind: 'component-intent', component: 'Badge', intent: 'classification' }];
    const [result] = evaluateRules(DESIGN_SYSTEM_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.component-intent-matches-registry',
    );
    expect(result.status).toBe('pass');
  });
});

describe('hierarchy.pattern-exception-documented', () => {
  it('passes with no declared exceptions', () => {
    const [result] = evaluateRules(DESIGN_SYSTEM_RULES, []).filter(
      (r) => r.ruleId === 'hierarchy.pattern-exception-documented',
    );
    expect(result.status).toBe('pass');
  });

  it('is exempted (not a plain pass) when a declared exception has a real reason', () => {
    const facts: GuardrailFact[] = [
      { kind: 'pattern-exception', pattern: 'confirmationDialog', reason: 'Inline undo instead — reversible, no confirm needed.' },
    ];
    const [result] = evaluateRules(DESIGN_SYSTEM_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.pattern-exception-documented',
    );
    expect(result.status).toBe('exempted');
  });

  it('is a violation when a declared exception has no reason', () => {
    const facts: GuardrailFact[] = [{ kind: 'pattern-exception', pattern: 'confirmationDialog', reason: '   ' }];
    const [result] = evaluateRules(DESIGN_SYSTEM_RULES, facts).filter(
      (r) => r.ruleId === 'hierarchy.pattern-exception-documented',
    );
    expect(result.status).toBe('violation');
  });
});

describe('HIERARCHY_RULES', () => {
  it('only contains rules this system can actually check — no manual/always-warning placeholders', () => {
    expect(HIERARCHY_RULES.every((rule) => rule.enforcement === 'runtime' || rule.enforcement === 'static')).toBe(true);
  });
});

describe('DESIGN_SYSTEM_RULES', () => {
  it('only contains rules this system can actually check — no manual/always-warning placeholders', () => {
    expect(DESIGN_SYSTEM_RULES.every((rule) => rule.enforcement === 'runtime' || rule.enforcement === 'static')).toBe(true);
  });
});

describe('hierarchy.semantic-status-not-brand-color', () => {
  it('passes when semantic status tokens resolve to colors distinct from the brand color', () => {
    const results = [
      contrastResult('primary', 'Primary (Brand)', '#c84e05'),
      contrastResult('success', 'Success', '#078539'),
      contrastResult('destructive', 'Destructive', '#d70000'),
    ];
    const passResults = evaluateRules(THEME_RULES, results).filter(
      (r) => r.ruleId === 'hierarchy.semantic-status-not-brand-color',
    );
    expect(passResults.every((r) => r.status === 'pass')).toBe(true);
    expect(passResults).toHaveLength(2);
  });

  it('is a violation when a semantic status token resolves to the exact brand color', () => {
    const results = [
      contrastResult('primary', 'Primary (Brand)', '#c84e05'),
      contrastResult('success', 'Success', '#c84e05'),
    ];
    const [result] = evaluateRules(THEME_RULES, results).filter(
      (r) => r.ruleId === 'hierarchy.semantic-status-not-brand-color',
    );
    expect(result.status).toBe('violation');
  });

  it('is case-insensitive when comparing hex values', () => {
    const results = [
      contrastResult('primary', 'Primary (Brand)', '#C84E05'),
      contrastResult('warning', 'Warning', '#c84e05'),
    ];
    const [result] = evaluateRules(THEME_RULES, results).filter(
      (r) => r.ruleId === 'hierarchy.semantic-status-not-brand-color',
    );
    expect(result.status).toBe('violation');
  });

  it('passes (nothing to compare yet) when the brand or semantic tokens have not resolved', () => {
    const [result] = evaluateRules(THEME_RULES, []).filter(
      (r) => r.ruleId === 'hierarchy.semantic-status-not-brand-color',
    );
    expect(result.status).toBe('pass');
  });
});

describe('THEME_RULES', () => {
  it('only contains rules this system can actually check — no manual/always-warning placeholders', () => {
    expect(THEME_RULES.every((rule) => rule.enforcement === 'runtime' || rule.enforcement === 'static')).toBe(true);
  });
});
