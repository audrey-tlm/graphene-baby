import type { RuleResult } from './types';

/**
 * The UX guardrails as they're presented to people — categories, wording and
 * numbering — mapped onto the rule ids in registry.ts that actually check them.
 * An item with no `ruleId` has no deterministic check yet and is shown as such
 * rather than as a pass.
 */
export interface GuardrailItem {
  readonly title: string;
  readonly explanation?: string;
  readonly ruleId?: string;
}

export interface GuardrailGroup {
  readonly title?: string;
  readonly items: readonly GuardrailItem[];
}

export interface GuardrailCategory {
  readonly title: string;
  readonly groups: readonly GuardrailGroup[];
}

export const GUARDRAIL_CATEGORIES: readonly GuardrailCategory[] = [
  {
    title: 'Universal UX guardrails',
    groups: [
      {
        items: [
          {
            title: 'Every page has exactly one H1.',
            explanation: 'The H1 is provided by the page-level PageHeader.',
            ruleId: 'hierarchy.single-h1',
          },
          {
            title: 'Heading levels never skip.',
            explanation: 'A heading can only be one level deeper than the previous heading level in the page hierarchy.',
            ruleId: 'hierarchy.heading-levels-no-skip',
          },
          {
            title: 'Declared spacing relationships use approved Graphene spacing tokens.',
            explanation: 'No raw spacing values are used where a Graphene spacing token exists.',
            ruleId: 'hierarchy.spacing-approved-token',
          },
          {
            title: 'Declared semantic statuses use approved semantic status tokens.',
            explanation: 'Statuses cannot use arbitrary or brand colors.',
            ruleId: 'hierarchy.status-semantic-token',
          },
          {
            title: 'A semantic status is never communicated by color alone.',
            explanation: 'A status must also have an explicit non-color indicator such as text, icon, or label.',
            ruleId: 'hierarchy.status-non-color-indicator',
          },
          {
            title: 'Semantic status colors remain distinct from the brand color unless explicitly mapped.',
            explanation: 'success, warning, destructive, highlight, etc. must resolve to their registered semantic tokens.',
            ruleId: 'hierarchy.semantic-status-not-brand-color',
          },
          {
            title: 'Declared content hierarchy uses approved treatments.',
            explanation:
              'Content declared as primary, secondary, or metadata can only use treatments registered for that hierarchy level.',
            ruleId: 'hierarchy.content-role-approved-treatment',
          },
          {
            title: 'Secondary and metadata content cannot use a treatment ranked above its primary content.',
            explanation: 'The visual treatment hierarchy must follow the registered Graphene hierarchy.',
            ruleId: 'hierarchy.content-role-strength-order',
          },
          {
            title: 'A declared component usage must match its registered intent.',
            explanation: 'Components cannot be used for purposes outside their registered intended use.',
            ruleId: 'hierarchy.component-intent-matches-registry',
          },
          {
            title: 'A declared exception to a registered pattern must include a non-empty reason.',
            ruleId: 'hierarchy.pattern-exception-documented',
          },
        ],
      },
    ],
  },
  {
    title: 'Pattern guardrails',
    groups: [
      {
        title: 'PageHeader / actions',
        items: [
          { title: 'A PageHeader has no more than two visible actions.', ruleId: 'hierarchy.max-two-header-actions' },
          {
            title: 'The PageHeader primary action is visually stronger than the secondary action.',
            explanation: 'The pattern defines the allowed primary and secondary treatments.',
            ruleId: 'hierarchy.primary-stronger-emphasis',
          },
          {
            title: 'A destructive action cannot occupy the PageHeader primary action slot.',
            ruleId: 'hierarchy.destructive-not-primary-slot',
          },
          {
            title: 'Destructive actions in an overflow menu are grouped separately from non-destructive actions.',
            ruleId: 'hierarchy.destructive-overflow-grouped',
          },
          {
            title: 'An overflow menu contains no more than the registered maximum number of actions.',
            explanation: 'The exact maximum is defined by the pattern.',
            ruleId: 'hierarchy.overflow-not-overloaded',
          },
        ],
      },
      {
        title: 'Empty states',
        items: [
          { title: 'Every EmptyState has both a title and a description.', ruleId: 'hierarchy.empty-state-explanation' },
          {
            title: 'An EmptyState description cannot be empty.',
            explanation: 'The empty state must provide explanatory content rather than only a generic empty label.',
          },
        ],
      },
      {
        title: 'Sections / focal points',
        items: [
          { title: 'Every declared Section has exactly one FocalPoint.', ruleId: 'hierarchy.single-focal-point' },
          {
            title: "A Section's declared FocalPoint must correspond to content that actually renders inside that Section.",
            ruleId: 'hierarchy.focal-point-renders-in-section',
          },
        ],
      },
    ],
  },
];

/** 'unchecked' — the guardrail has no deterministic check wired up yet. */
export type GuardrailItemStatus = 'pass' | 'warning' | 'violation' | 'unchecked';

export interface EvaluatedGuardrailItem {
  readonly item: GuardrailItem;
  readonly status: GuardrailItemStatus;
  readonly results: readonly RuleResult[];
}

/**
 * Worst result wins: violation > warning > pass. An 'exempted' result (a
 * documented, registered deviation) counts as a pass — the guardrail explicitly
 * allows it.
 */
export function evaluateGuardrailItem(item: GuardrailItem, results: readonly RuleResult[]): EvaluatedGuardrailItem {
  if (item.ruleId === undefined) return { item, status: 'unchecked', results: [] };
  const own = results.filter((r) => r.ruleId === item.ruleId);
  const status: GuardrailItemStatus = own.some((r) => r.status === 'violation')
    ? 'violation'
    : own.some((r) => r.status === 'warning')
      ? 'warning'
      : 'pass';
  return { item, status, results: own };
}

export function evaluateGuardrailCatalog(results: readonly RuleResult[]): EvaluatedGuardrailItem[] {
  return GUARDRAIL_CATEGORIES.flatMap((category) =>
    category.groups.flatMap((group) => group.items.map((item) => evaluateGuardrailItem(item, results))),
  );
}
