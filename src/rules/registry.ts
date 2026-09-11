import { isIntendedUsage } from './config/componentRegistry';
import {
  BRAND_TOKEN_ID,
  SEMANTIC_BRAND_MAPPING_EXCEPTIONS,
  isSemanticStatusTokenId,
} from './config/semanticColorMapping';
import { isApprovedSpacingToken } from './config/spacing';
import { contentRoleStrength, isApprovedContentRoleTreatment } from './config/typography';
import type {
  ActionGroupFact,
  ComponentIntentFact,
  ContentRoleFact,
  FocalPointFact,
  GuardrailFact,
  HeadingFact,
  PatternExceptionFact,
  SectionFact,
  SpacingFact,
  StatusFact,
} from './runtimeFacts';
import type { Rule, RuleResult, RuleStatus } from './types';
import type { ContrastResult } from '../theme/contrast';

function isActionGroupFact(fact: GuardrailFact): fact is ActionGroupFact {
  return fact.kind === 'action-group';
}

function isHeadingFact(fact: GuardrailFact): fact is HeadingFact {
  return fact.kind === 'heading';
}

function isSectionFact(fact: GuardrailFact): fact is SectionFact {
  return fact.kind === 'section';
}

function isFocalPointFact(fact: GuardrailFact): fact is FocalPointFact {
  return fact.kind === 'focal-point';
}

function isContentRoleFact(fact: GuardrailFact): fact is ContentRoleFact {
  return fact.kind === 'content-role';
}

function isStatusFact(fact: GuardrailFact): fact is StatusFact {
  return fact.kind === 'status';
}

function isSpacingFact(fact: GuardrailFact): fact is SpacingFact {
  return fact.kind === 'spacing';
}

function isComponentIntentFact(fact: GuardrailFact): fact is ComponentIntentFact {
  return fact.kind === 'component-intent';
}

function isPatternExceptionFact(fact: GuardrailFact): fact is PatternExceptionFact {
  return fact.kind === 'pattern-exception';
}

/** A 'default'/undefined-variant Button is solid — the same visual weight as `primary`. Anything in here reads as subordinate. */
const SUBDUED_VARIANTS = new Set(['outline', 'ghost', 'link', 'secondary']);

/**
 * `evaluate` always returns 'pass' — used for rules Graphene/TypeScript enforce
 * by construction, so there's genuinely nothing to check at runtime, but the
 * panel should still show a confirmed pass rather than omit the rule.
 */
function staticRule(
  id: string,
  category: Rule<never>['category'],
  description: string,
  passDetail: string,
): Rule<readonly GuardrailFact[]> {
  return {
    id,
    category,
    description,
    enforcement: 'static',
    evaluate: () => [{ ruleId: id, status: 'pass', detail: passDetail }],
  };
}

/**
 * Hierarchy guardrails — page structure, actions, and headings. Only rules
 * this system can actually verify: `'runtime'` rules are checked against
 * facts components reported as they rendered (see runtimeFacts.tsx); `'static'`
 * rules are guaranteed by the type system. Design judgment calls that no
 * amount of fact-collection can answer (e.g. "is there one clear primary
 * section?") were deliberately left out rather than faked as always-passing
 * or always-warning — see git history for the ones that were removed.
 */
export const HIERARCHY_RULES: readonly Rule<readonly GuardrailFact[]>[] = [
  // 1. One H1 per page.
  {
    id: 'hierarchy.single-h1',
    category: 'hierarchy',
    description: 'Every page declares exactly one H1 (via PageHeader), so page-level hierarchy stays predictable.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const count = facts.filter((f) => f.kind === 'page-header').length;
      return [
        {
          ruleId: 'hierarchy.single-h1',
          status: count === 1 ? 'pass' : 'violation',
          detail: count === 1 ? 'Exactly one H1 (PageHeader) on this page.' : `Found ${count} H1s (expected exactly 1).`,
        },
      ];
    },
  },

  // 2. Maximum 2 directly visible primary header actions.
  staticRule(
    'hierarchy.max-two-header-actions',
    'hierarchy',
    'A page header shows at most 2 visible actions — anything more belongs in an overflow menu.',
    "ActionGroup's `primary` and `secondary` props each accept a single element, not a list — a third visible action is a type error, not a runtime check. Additional actions can only be added through the typed `overflow` prop.",
  ),

  // 3. Primary action must have stronger visual emphasis than secondary actions.
  {
    id: 'hierarchy.primary-stronger-emphasis',
    category: 'hierarchy',
    description: 'The primary action reads as visually stronger than the secondary action next to it.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const groups = facts.filter(isActionGroupFact);
      if (groups.length === 0) {
        return [{ ruleId: 'hierarchy.primary-stronger-emphasis', status: 'pass', detail: 'No action groups on this page.' }];
      }
      return groups.map((group, i): RuleResult => {
        if (!group.hasSecondary) {
          return {
            ruleId: 'hierarchy.primary-stronger-emphasis',
            status: 'pass',
            detail: `Action group ${i + 1}: only one action shown — nothing to compare.`,
          };
        }
        const secondaryEmphasis = group.secondaryVariant ?? 'default';
        const primaryEmphasis = group.primaryVariant ?? 'default';
        const secondaryIsSubdued = SUBDUED_VARIANTS.has(secondaryEmphasis) && secondaryEmphasis !== primaryEmphasis;
        return {
          ruleId: 'hierarchy.primary-stronger-emphasis',
          status: secondaryIsSubdued ? 'pass' : 'violation',
          detail: secondaryIsSubdued
            ? `Action group ${i + 1}: primary is "${primaryEmphasis}", secondary is "${secondaryEmphasis}" — clearly subordinate.`
            : `Action group ${i + 1}: secondary action uses "${secondaryEmphasis}", the same weight as primary. Use outline/ghost/link.`,
        };
      });
    },
  },

  // 4. Destructive actions must not use primary-action emphasis.
  {
    id: 'hierarchy.destructive-not-primary-emphasis',
    category: 'hierarchy',
    description: 'Destructive actions never take the primary slot, and are visually separated in overflow menus.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const groups = facts.filter(isActionGroupFact);
      if (groups.length === 0) {
        return [
          { ruleId: 'hierarchy.destructive-not-primary-emphasis', status: 'pass', detail: 'No action groups on this page.' },
        ];
      }
      return groups.map((group, i): RuleResult => {
        const problems: string[] = [];
        if (group.primaryVariant === 'destructive') problems.push('the primary action is styled destructive');
        if (group.overflowHasUnseparatedDestructive) {
          problems.push('a destructive overflow action has no separator setting it apart');
        }
        return {
          ruleId: 'hierarchy.destructive-not-primary-emphasis',
          status: problems.length > 0 ? 'violation' : 'pass',
          detail:
            problems.length > 0
              ? `Action group ${i + 1}: ${problems.join('; ')}.`
              : `Action group ${i + 1}: no destructive action competes with the primary path.`,
        };
      });
    },
  },

  // 5. Heading levels must follow a consistent hierarchy (no skipping).
  {
    id: 'hierarchy.heading-levels-no-skip',
    category: 'hierarchy',
    description: 'Heading levels on a page never skip (e.g. an H3 without an H2 above it).',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const levels = new Set(facts.filter(isHeadingFact).map((f) => f.level));
      if (levels.size === 0) {
        return [{ ruleId: 'hierarchy.heading-levels-no-skip', status: 'pass', detail: 'No headings reported yet.' }];
      }
      const maxLevel = Math.max(...levels);
      const gaps = Array.from({ length: maxLevel }, (_, i) => i + 1).filter((l) => !levels.has(l as 1 | 2 | 3));
      return [
        {
          ruleId: 'hierarchy.heading-levels-no-skip',
          status: gaps.length > 0 ? 'violation' : 'pass',
          detail:
            gaps.length > 0
              ? `H${gaps.join(', H')} skipped — an H${maxLevel} is used without it.`
              : `Heading levels used: ${[...levels]
                  .sort()
                  .map((l) => `H${l}`)
                  .join(', ')} — no gaps.`,
        },
      ];
    },
  },

  // Empty states must provide an explanation (title + description), by construction.
  staticRule(
    'hierarchy.empty-state-explanation',
    'hierarchy',
    'An empty state always explains what the area is for — never just "Nothing here".',
    "Graphene's Empty/DataTableEmptyState components require a `title` and `description` prop — omitting the explanation is a type error, not a runtime check.",
  ),

  // Important actions should not be hidden behind an overflow menu.
  {
    id: 'hierarchy.overflow-not-overloaded',
    category: 'hierarchy',
    description: 'Overflow menus stay short enough that nothing important gets lost in them.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const groups = facts.filter(isActionGroupFact);
      if (groups.length === 0) {
        return [{ ruleId: 'hierarchy.overflow-not-overloaded', status: 'pass', detail: 'No action groups on this page.' }];
      }
      return groups.map((group, i): RuleResult => {
        const status: RuleStatus = group.overflowCount > 4 ? 'warning' : 'pass';
        return {
          ruleId: 'hierarchy.overflow-not-overloaded',
          status,
          detail:
            status === 'warning'
              ? `Action group ${i + 1}: ${group.overflowCount} actions in the "…" menu — worth checking none of them is actually important enough to surface directly.`
              : `Action group ${i + 1}: ${group.overflowCount} overflow action${group.overflowCount === 1 ? '' : 's'}.`,
        };
      });
    },
  },

  // Guardrail 1 — content declares its hierarchy role via <ContentText role="…">, checked
  // against src/rules/config/typography.ts rather than judged from how it looks.
  {
    id: 'hierarchy.content-role-approved-treatment',
    category: 'hierarchy',
    description: 'Content declaring a hierarchy role (primary/secondary/metadata) uses an approved treatment for that role.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const roles = facts.filter(isContentRoleFact);
      if (roles.length === 0) {
        return [{ ruleId: 'hierarchy.content-role-approved-treatment', status: 'pass', detail: 'No declared content roles on this page.' }];
      }
      return roles.map((f, i): RuleResult => {
        const approved = isApprovedContentRoleTreatment(f.role, f.className);
        return {
          ruleId: 'hierarchy.content-role-approved-treatment',
          status: approved ? 'pass' : 'violation',
          detail: approved
            ? `ContentText ${i + 1} ("${f.role}"): "${f.className}" is an approved ${f.role} treatment.`
            : `ContentText ${i + 1} ("${f.role}"): "${f.className}" is not an approved ${f.role} treatment.`,
        };
      });
    },
  },

  // Guardrail 1 (continued) — a lower role can't outweigh a higher one, within the same <Section>.
  // This is the deterministic replacement for the manual "secondary must read as lower emphasis"
  // rule removed earlier: it now has an explicit declaration to check instead of a visual judgment.
  {
    id: 'hierarchy.content-role-strength-order',
    category: 'hierarchy',
    description: 'Within one Section, secondary/metadata content never uses a treatment as strong as or stronger than primary.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const roles = facts.filter(isContentRoleFact);
      if (roles.length === 0) {
        return [{ ruleId: 'hierarchy.content-role-strength-order', status: 'pass', detail: 'No declared content roles on this page.' }];
      }
      const bySection = new Map<string, ContentRoleFact[]>();
      for (const fact of roles) {
        const group = bySection.get(fact.sectionKey) ?? [];
        group.push(fact);
        bySection.set(fact.sectionKey, group);
      }
      return Array.from(bySection.values()).map((group, i): RuleResult => {
        const primaries = group.filter((f) => f.role === 'primary');
        const others = group.filter((f) => f.role !== 'primary');
        if (primaries.length === 0 || others.length === 0) {
          return {
            ruleId: 'hierarchy.content-role-strength-order',
            status: 'pass',
            detail: `Section ${i + 1}: nothing to compare — needs both a primary and a secondary/metadata role declared.`,
          };
        }
        const minPrimaryStrength = Math.min(...primaries.map((f) => contentRoleStrength(f.role, f.className)));
        const violators = others.filter((f) => contentRoleStrength(f.role, f.className) >= minPrimaryStrength);
        return {
          ruleId: 'hierarchy.content-role-strength-order',
          status: violators.length > 0 ? 'violation' : 'pass',
          detail:
            violators.length > 0
              ? `Section ${i + 1}: ${violators.length} ${violators.map((f) => f.role).join('/')} element(s) match or exceed primary's strength.`
              : `Section ${i + 1}: secondary/metadata content stays visually subordinate to primary.`,
        };
      });
    },
  },

  // Guardrail 2 — exactly one <FocalPoint> per <Section>, referencing an element that
  // actually exists. Reinstated as a real check now that there's a declaration to verify —
  // it existed only as a manual (always-warning) rule before and was removed for that reason.
  {
    id: 'hierarchy.single-focal-point',
    category: 'hierarchy',
    description: 'Each declared Section has exactly one FocalPoint, and it matches something that actually renders inside it.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const sections = facts.filter(isSectionFact);
      if (sections.length === 0) {
        return [{ ruleId: 'hierarchy.single-focal-point', status: 'pass', detail: 'No declared sections on this page.' }];
      }
      const focalPoints = facts.filter(isFocalPointFact);
      return sections.map((section, i): RuleResult => {
        const inSection = focalPoints.filter((fp) => fp.sectionKey === section.sectionKey);
        if (inSection.length === 0) {
          return {
            ruleId: 'hierarchy.single-focal-point',
            status: 'violation',
            detail: `Section ${i + 1}: declares focalPoint="${section.focalPoint}" but no FocalPoint was found inside it.`,
          };
        }
        if (inSection.length > 1) {
          return {
            ruleId: 'hierarchy.single-focal-point',
            status: 'violation',
            detail: `Section ${i + 1}: has ${inSection.length} FocalPoints — only one is allowed per section.`,
          };
        }
        if (inSection[0].name !== section.focalPoint) {
          return {
            ruleId: 'hierarchy.single-focal-point',
            status: 'violation',
            detail: `Section ${i + 1}: declares focalPoint="${section.focalPoint}" but the FocalPoint inside is named "${inSection[0].name}".`,
          };
        }
        return {
          ruleId: 'hierarchy.single-focal-point',
          status: 'pass',
          detail: `Section ${i + 1}: focal point "${section.focalPoint}" declared once and present.`,
        };
      });
    },
  },

  // Guardrail 3 — <Stack relationship="related|group|section|separated" gap="gap-N"> declares why
  // two pieces of content sit a given distance apart; checked against SPACING_TOKENS instead of
  // asking whether the spacing "feels right".
  {
    id: 'hierarchy.spacing-approved-token',
    category: 'hierarchy',
    description: 'A declared spacing relationship uses one of its approved Graphene gap tokens.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const stacks = facts.filter(isSpacingFact);
      if (stacks.length === 0) {
        return [{ ruleId: 'hierarchy.spacing-approved-token', status: 'pass', detail: 'No declared spacing relationships on this page.' }];
      }
      return stacks.map((f, i): RuleResult => {
        const approved = isApprovedSpacingToken(f.relationship, f.gapClassName);
        return {
          ruleId: 'hierarchy.spacing-approved-token',
          status: approved ? 'pass' : 'violation',
          detail: approved
            ? `Stack ${i + 1} ("${f.relationship}"): "${f.gapClassName}" is an approved ${f.relationship} token.`
            : `Stack ${i + 1} ("${f.relationship}"): "${f.gapClassName}" is not approved for "${f.relationship}".`,
        };
      });
    },
  },

  // Guardrail 5 — <Status> requires a non-color indicator (label or icon) by construction:
  // its props are typed so omitting both is a type error, the same technique ActionGroup uses
  // for its primary/secondary slots. This can never actually fail; it's still 'runtime' (not
  // 'static') so the panel lists every declared status on the page, not just a generic pass.
  // Reinstated for the same reason as Guardrail 2 above — it existed only as a manual
  // (always-warning) rule before, and was removed until there was something to verify.
  {
    id: 'hierarchy.status-non-color-indicator',
    category: 'accessibility',
    description: 'A declared Status always communicates its meaning through more than color alone.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const statuses = facts.filter(isStatusFact);
      if (statuses.length === 0) {
        return [{ ruleId: 'hierarchy.status-non-color-indicator', status: 'pass', detail: 'No declared statuses on this page.' }];
      }
      return statuses.map((f, i): RuleResult => {
        const indicators = [f.hasLabel ? 'visible text' : null, f.hasIcon ? 'an icon' : null].filter(Boolean);
        return {
          ruleId: 'hierarchy.status-non-color-indicator',
          status: indicators.length > 0 ? 'pass' : 'violation',
          detail:
            indicators.length > 0
              ? `Status ${i + 1} ("${f.status}"): backed by ${indicators.join(' and ')}, not color alone.`
              : `Status ${i + 1} ("${f.status}"): has neither a label nor an icon — relies on color alone.`,
        };
      });
    },
  },
  {
    id: 'hierarchy.status-semantic-token',
    category: 'accessibility',
    description: "A declared Status always maps to one of Graphene's semantic Badge tokens, never a raw color.",
    enforcement: 'runtime',
    evaluate: (facts) => {
      const statuses = facts.filter(isStatusFact);
      if (statuses.length === 0) {
        return [{ ruleId: 'hierarchy.status-semantic-token', status: 'pass', detail: 'No declared statuses on this page.' }];
      }
      return statuses.map((f, i): RuleResult => ({
        ruleId: 'hierarchy.status-semantic-token',
        status: 'pass',
        detail: `Status ${i + 1}: uses the semantic "${f.status}" token.`,
      }));
    },
  },
];

/**
 * Design-system-usage guardrails. The two rules that used to live here were
 * removed as judgment calls this system had no way to verify ("is this the
 * right component for the job?") — the two below replace them now that
 * there's something explicit to check: a *declared* component intent
 * (Guardrails 4b & 6) or a *declared* pattern exception (Guardrail 7),
 * rather than an inference from how the code looks.
 */
export const DESIGN_SYSTEM_RULES: readonly Rule<readonly GuardrailFact[]>[] = [
  // Guardrails 4b & 6 — <DeclaredIntent component="Button" intent="action"> is checked
  // against COMPONENT_REGISTRY instead of asking whether the component choice "fits".
  {
    id: 'hierarchy.component-intent-matches-registry',
    category: 'design-system',
    description: 'A declared component usage matches that component\'s registered intended purpose.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const declarations = facts.filter(isComponentIntentFact);
      if (declarations.length === 0) {
        return [
          {
            ruleId: 'hierarchy.component-intent-matches-registry',
            status: 'pass',
            detail: 'No declared component intents on this page.',
          },
        ];
      }
      return declarations.map((f, i): RuleResult => {
        const matches = isIntendedUsage(f.component, f.intent);
        return {
          ruleId: 'hierarchy.component-intent-matches-registry',
          status: matches ? 'pass' : 'violation',
          detail: matches
            ? `Declaration ${i + 1}: ${f.component} used for "${f.intent}" — matches its registered purpose.`
            : `Declaration ${i + 1}: ${f.component} used for "${f.intent}", which isn't in its registered intendedFor list.`,
        };
      });
    },
  },

  // Guardrail 7 — <PatternException pattern="…" reason="…"> must carry a real reason.
  // Can only confirm a *declared* exception is documented; cannot detect an *undeclared*
  // one-off — see src/rules/config/patternRegistry.ts for why that's out of scope by design.
  {
    id: 'hierarchy.pattern-exception-documented',
    category: 'design-system',
    description: 'A declared exception from a registered pattern always carries a non-empty reason.',
    enforcement: 'runtime',
    evaluate: (facts) => {
      const exceptions = facts.filter(isPatternExceptionFact);
      if (exceptions.length === 0) {
        return [
          {
            ruleId: 'hierarchy.pattern-exception-documented',
            status: 'pass',
            detail: 'No declared pattern exceptions on this page — established patterns are used as registered.',
          },
        ];
      }
      return exceptions.map((f, i): RuleResult => {
        const documented = f.reason.trim().length > 0;
        return {
          ruleId: 'hierarchy.pattern-exception-documented',
          status: documented ? 'exempted' : 'violation',
          detail: documented
            ? `Exception ${i + 1}: deviates from "${f.pattern}" — ${f.reason}`
            : `Exception ${i + 1}: deviates from "${f.pattern}" with no reason given.`,
        };
      });
    },
  },
];

/**
 * Theme-token guardrails. Unlike the rules above, these aren't checked against
 * what a page declared — they're checked against the *resolved* color a token
 * renders as, which only exists once the theme draft has been applied to the
 * DOM (see theme/contrast.ts). Kept as a separate array (not folded into
 * ALL_HIERARCHY_RULES) because its `evaluate` takes `ContrastResult[]`, not
 * `GuardrailFact[]` — a different fact shape, same Rule/evaluate contract.
 */
export const THEME_RULES: readonly Rule<readonly ContrastResult[]>[] = [
  // New guardrail — a semantic status token (success/warning/destructive/highlight)
  // must resolve to its own dedicated color, not the brand color. Declaring a
  // Status as "success" is not enough on its own (Status's type already forbids
  // picking the brand token by name) — someone can still override --success's
  // *value* in the theme editor to match --primary, which this catches instead
  // of trusting the token's name.
  {
    id: 'hierarchy.semantic-status-not-brand-color',
    category: 'design-system',
    description: 'A semantic status token resolves to its own dedicated color, not the brand color, unless explicitly mapped.',
    enforcement: 'runtime',
    evaluate: (results) => {
      const brand = results.find((r) => r.pair.id === BRAND_TOKEN_ID);
      const statusResults = results.filter((r) => isSemanticStatusTokenId(r.pair.id));
      if (!brand || statusResults.length === 0) {
        return [
          {
            ruleId: 'hierarchy.semantic-status-not-brand-color',
            status: 'pass',
            detail: 'Brand or semantic status tokens not resolved yet.',
          },
        ];
      }
      return statusResults.map((r): RuleResult => {
        const collidesWithBrand = r.backgroundHex.toLowerCase() === brand.backgroundHex.toLowerCase();
        if (!collidesWithBrand) {
          return {
            ruleId: 'hierarchy.semantic-status-not-brand-color',
            status: 'pass',
            detail: `"${r.pair.label}" (${r.backgroundHex}) is distinct from the brand color.`,
          };
        }
        const exempted = isSemanticStatusTokenId(r.pair.id) && SEMANTIC_BRAND_MAPPING_EXCEPTIONS.has(r.pair.id);
        return {
          ruleId: 'hierarchy.semantic-status-not-brand-color',
          status: exempted ? 'exempted' : 'violation',
          detail: exempted
            ? `"${r.pair.label}" intentionally reuses the brand color (${r.backgroundHex}) — declared in SEMANTIC_BRAND_MAPPING_EXCEPTIONS.`
            : `"${r.pair.label}" resolves to the brand color (${r.backgroundHex}) instead of its own dedicated token.`,
        };
      });
    },
  },
];

/** Every GuardrailFact-based rule this registry defines, for lookups (e.g. showing a result's rule description in the UI). */
export const ALL_HIERARCHY_RULES: readonly Rule<readonly GuardrailFact[]>[] = [...HIERARCHY_RULES, ...DESIGN_SYSTEM_RULES];

export const RULE_DESCRIPTION_BY_ID: Readonly<Record<string, string>> = Object.fromEntries(
  [...ALL_HIERARCHY_RULES, ...THEME_RULES].map((rule) => [rule.id, rule.description]),
);

export function evaluateRules<Facts>(rules: readonly Rule<Facts>[], facts: Facts): RuleResult[] {
  return rules.flatMap((rule) => rule.evaluate(facts));
}
