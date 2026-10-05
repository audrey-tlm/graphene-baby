import { describe, expect, it } from 'vitest';

import { evaluateGuardrailItem, GUARDRAIL_CATEGORIES } from './guardrailCatalog';
import { ALL_HIERARCHY_RULES, THEME_RULES } from './registry';

const catalogRuleIds = GUARDRAIL_CATEGORIES.flatMap((c) => c.groups.flatMap((g) => g.items.map((i) => i.ruleId))).filter(
  (id): id is string => id !== undefined,
);
const registryRuleIds = [...ALL_HIERARCHY_RULES, ...THEME_RULES].map((rule) => rule.id);

describe('GUARDRAIL_CATEGORIES', () => {
  it('maps every registered rule to exactly one guardrail', () => {
    expect([...catalogRuleIds].sort()).toEqual([...registryRuleIds].sort());
  });
});

describe('evaluateGuardrailItem', () => {
  const item = { title: 'x', ruleId: 'r' };

  it('is the worst status among its rule’s results', () => {
    const results = [
      { ruleId: 'r', status: 'pass', detail: '' },
      { ruleId: 'r', status: 'warning', detail: '' },
      { ruleId: 'r', status: 'violation', detail: '' },
    ] as const;
    expect(evaluateGuardrailItem(item, results).status).toBe('violation');
  });

  it('treats an exempted result as a pass', () => {
    expect(evaluateGuardrailItem(item, [{ ruleId: 'r', status: 'exempted', detail: '' }]).status).toBe('pass');
  });

  it('ignores results from other rules', () => {
    expect(evaluateGuardrailItem(item, [{ ruleId: 'other', status: 'violation', detail: '' }]).status).toBe('pass');
  });

  it('is unchecked when no rule is mapped', () => {
    expect(evaluateGuardrailItem({ title: 'x' }, []).status).toBe('unchecked');
  });
});
