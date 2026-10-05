import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  useTheme,
} from '@gravitee/graphene-core';
import {
  ChevronRightIcon,
  CircleCheckIcon,
  CircleMinusIcon,
  OctagonXIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from '@gravitee/graphene-core/icons';
import { useMemo, useState } from 'react';

import {
  evaluateGuardrailCatalog,
  evaluateGuardrailItem,
  GUARDRAIL_CATEGORIES,
  type EvaluatedGuardrailItem,
  type GuardrailItemStatus,
} from '../rules/guardrailCatalog';
import { useHierarchyReport } from '../rules/useHierarchyReport';
import type { RuleResult } from '../rules/types';
import { useContrastReport } from '../theme/contrast';
import { useThemeConfig } from '../theme/ThemeConfigContext';
import { CONTRAST_PAIRS } from '../theme/tokenSchema.generated';

const CORE_PAIRS = CONTRAST_PAIRS.filter((pair) => pair.isCore);

const STATUS_META: Record<
  GuardrailItemStatus,
  {
    readonly icon: typeof CircleCheckIcon;
    readonly badgeVariant: 'success' | 'warning' | 'destructive' | 'secondary';
    readonly label: string;
    readonly iconClassName: string;
  }
> = {
  pass: { icon: CircleCheckIcon, badgeVariant: 'success', label: 'Pass', iconClassName: 'text-success' },
  warning: { icon: TriangleAlertIcon, badgeVariant: 'warning', label: 'Warning', iconClassName: 'text-warning' },
  violation: { icon: OctagonXIcon, badgeVariant: 'destructive', label: 'Violation', iconClassName: 'text-destructive' },
  unchecked: { icon: CircleMinusIcon, badgeVariant: 'secondary', label: 'Not checked', iconClassName: 'text-muted-foreground' },
};

/** One guardrail: status icon + badge (never color alone — see hierarchy.status-non-color-indicator), its wording, and what failed. */
function GuardrailRow({ number, evaluated }: { readonly number: number; readonly evaluated: EvaluatedGuardrailItem }) {
  const meta = STATUS_META[evaluated.status];
  const Icon = meta.icon;
  const failing = evaluated.results.filter((r) => r.status === 'violation' || r.status === 'warning');

  return (
    <li className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-xs">
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${meta.iconClassName}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-foreground">
            {number}. {evaluated.item.title}
          </span>
          <Badge variant={meta.badgeVariant} className="shrink-0">
            {meta.label}
          </Badge>
        </div>
        {evaluated.item.explanation ? <p className="text-muted-foreground">{evaluated.item.explanation}</p> : null}
        {failing.length > 0 ? (
          <ul className="flex flex-col gap-0.5 text-foreground">
            {failing.map((result, i) => (
              <li key={i}>{result.detail}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

/** The guardrail catalog, by category, numbered as written. */
function GuardrailsReport({ results }: { readonly results: readonly RuleResult[] }) {
  const evaluated = useMemo(() => evaluateGuardrailCatalog(results), [results]);
  const count = (status: GuardrailItemStatus) => evaluated.filter((e) => e.status === status).length;
  const violations = count('violation');
  const warnings = count('warning');
  const passes = count('pass');
  const unchecked = count('unchecked');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="destructive">{violations} violation{violations === 1 ? '' : 's'}</Badge>
        <Badge variant="warning">{warnings} warning{warnings === 1 ? '' : 's'}</Badge>
        <Badge variant="success">{passes} pass{passes === 1 ? '' : 'es'}</Badge>
        {unchecked > 0 ? <Badge variant="secondary">{unchecked} not checked</Badge> : null}
      </div>

      {GUARDRAIL_CATEGORIES.map((category) => {
        let number = 0;
        const categoryItems = category.groups.flatMap((group) => group.items);
        const failingCount = categoryItems.filter((item) => {
          const { status } = evaluateGuardrailItem(item, results);
          return status === 'violation' || status === 'warning';
        }).length;
        return (
          <Collapsible key={category.title} defaultOpen asChild>
            <section className="flex flex-col gap-3">
              <h2>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group/trigger -mx-1.5 w-[calc(100%+0.75rem)] justify-start gap-1.5 px-1.5 text-sm font-semibold text-foreground"
                  >
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="size-4 transition-transform group-data-[state=open]/trigger:rotate-90"
                    />
                    {category.title}
                    <span className="ml-auto flex items-center gap-1.5">
                      {failingCount > 0 ? <Badge variant="destructive">{failingCount} failing</Badge> : null}
                      <Badge variant="secondary">{categoryItems.length}</Badge>
                    </span>
                  </Button>
                </CollapsibleTrigger>
              </h2>
              <CollapsibleContent className="flex flex-col gap-3">
                {category.groups.map((group, groupIndex) => (
                  <div key={group.title ?? groupIndex} className="flex flex-col gap-2">
                    {group.title ? <h3 className="text-xs font-medium text-muted-foreground">{group.title}</h3> : null}
                    <ul className="flex flex-col gap-2">
                      {group.items.map((item) => {
                        number += 1;
                        return (
                          <GuardrailRow key={item.title} number={number} evaluated={evaluateGuardrailItem(item, results)} />
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </CollapsibleContent>
            </section>
          </Collapsible>
        );
      })}
    </div>
  );
}

/** Overall verdict for the header badge, counted per guardrail: worst status wins (violation > warning > pass). */
function GuardrailsStatusBadge({ results }: { readonly results: readonly RuleResult[] }) {
  const evaluated = useMemo(() => evaluateGuardrailCatalog(results), [results]);
  const violationCount = evaluated.filter((e) => e.status === 'violation').length;
  const warningCount = evaluated.filter((e) => e.status === 'warning').length;
  if (violationCount > 0) {
    return (
      <Badge variant="destructive">
        <OctagonXIcon aria-hidden="true" />
        {violationCount} guardrail{violationCount === 1 ? '' : 's'} failing
      </Badge>
    );
  }
  if (warningCount > 0) {
    return (
      <Badge variant="warning">
        <TriangleAlertIcon aria-hidden="true" />
        {warningCount} guardrail warning{warningCount === 1 ? '' : 's'}
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      <CircleCheckIcon aria-hidden="true" />
      Guardrails pass
    </Badge>
  );
}

export function HierarchyGuardrailsPanel() {
  const { draft } = useThemeConfig();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  // Same dependency key as ThemeSettingsPanel, so theme-token rules re-run on draft / mode changes.
  const contrastResults = useContrastReport(`${JSON.stringify(draft)}::${resolvedTheme}`, CORE_PAIRS);
  const hierarchyResults = useHierarchyReport(contrastResults);

  return (
    <div className="flex items-center gap-2">
      <GuardrailsStatusBadge results={hierarchyResults} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <ShieldCheckIcon aria-hidden="true" />
            UX guardrails
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col gap-0">
          <SheetHeader>
            <SheetTitle>UX guardrails</SheetTitle>
            <SheetDescription>
              A guardrail is deterministic when Graphene can evaluate it as pass/fail from the structure, props, tokens, or
              registered pattern rules — without interpreting whether a design “looks good.”
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4">
            <div className="py-2 pb-4">
              <GuardrailsReport results={hierarchyResults} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
