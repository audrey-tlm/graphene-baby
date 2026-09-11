import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Label,
  ScrollArea,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  ToggleGroup,
  ToggleGroupItem,
  useTheme,
  type ResolvedTheme,
} from '@gravitee/graphene-core';
import {
  ChevronRightIcon,
  CircleCheckIcon,
  OctagonXIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  TriangleAlertIcon,
} from '@gravitee/graphene-core/icons';
import { useMemo, useState } from 'react';

import { RULE_DESCRIPTION_BY_ID } from '../rules/registry';
import { useHierarchyReport } from '../rules/useHierarchyReport';
import type { RuleResult, RuleStatus } from '../rules/types';
import type { ContrastResult } from '../theme/contrast';
import { useContrastReport } from '../theme/contrast';
import { useApplyThemeDraft, useThemeConfig } from '../theme/ThemeConfigContext';
import { CONTRAST_PAIRS } from '../theme/tokenSchema.generated';

const CORE_PAIRS = CONTRAST_PAIRS.filter((pair) => pair.isCore);

const STATUS_META: Record<
  RuleStatus,
  {
    readonly icon: typeof CircleCheckIcon;
    readonly badgeVariant: 'success' | 'warning' | 'destructive' | 'highlight';
    readonly label: string;
    readonly iconClassName: string;
  }
> = {
  pass: { icon: CircleCheckIcon, badgeVariant: 'success', label: 'Pass', iconClassName: 'text-success' },
  warning: { icon: TriangleAlertIcon, badgeVariant: 'warning', label: 'Warning', iconClassName: 'text-warning' },
  violation: { icon: OctagonXIcon, badgeVariant: 'destructive', label: 'Violation', iconClassName: 'text-destructive' },
  exempted: { icon: ShieldCheckIcon, badgeVariant: 'highlight', label: 'Exempted', iconClassName: 'text-highlight' },
};

function ColorField({
  tokenName,
  label,
  value,
  onChange,
  onReset,
  isOverridden,
}: {
  readonly tokenName: string;
  readonly label: string;
  readonly value: string | undefined;
  readonly onChange: (hex: string) => void;
  readonly onReset: () => void;
  readonly isOverridden: boolean;
}) {
  const inputId = `token-${tokenName}`;
  return (
    <div className="flex flex-1 items-center gap-2">
      <input
        id={inputId}
        type="color"
        className="size-8 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0"
        value={value ?? '#000000'}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} color`}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Label htmlFor={inputId} className="text-xs text-muted-foreground">
          {label}
        </Label>
        <span className="truncate text-xs text-foreground">{value ?? '…'}</span>
      </div>
      {isOverridden ? (
        <Button variant="ghost" size="icon-xs" aria-label={`Reset ${label} to Graphene default`} onClick={onReset}>
          <RefreshCwIcon aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

function ContrastPairRow({ result }: { readonly result: ContrastResult }) {
  const { draft, setTokenValue, resetToken } = useThemeConfig();
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{result.pair.label}</h3>
        <Badge variant={result.pass ? 'success' : 'destructive'}>
          {result.ratio.toFixed(2)}:1 {result.pass ? 'AA pass' : 'AA fail'}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <ColorField
          tokenName={result.pair.background}
          label="Background"
          value={result.backgroundHex}
          isOverridden={draft[result.pair.background]?.[resolvedTheme] !== undefined}
          onChange={(hex) => setTokenValue(result.pair.background, resolvedTheme, hex)}
          onReset={() => resetToken(result.pair.background, resolvedTheme)}
        />
        <ColorField
          tokenName={result.pair.foreground}
          label="Foreground"
          value={result.foregroundHex}
          isOverridden={draft[result.pair.foreground]?.[resolvedTheme] !== undefined}
          onChange={(hex) => setTokenValue(result.pair.foreground, resolvedTheme, hex)}
          onReset={() => resetToken(result.pair.foreground, resolvedTheme)}
        />
      </div>
    </div>
  );
}

/** One guardrail result: status badge + icon (never color alone — see hierarchy.color-not-only-indicator) plus the rule it's for. */
function HierarchyResultRow({ result }: { readonly result: RuleResult }) {
  const meta = STATUS_META[result.status];
  const Icon = meta.icon;
  const description = RULE_DESCRIPTION_BY_ID[result.ruleId] ?? result.ruleId;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-xs">
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${meta.iconClassName}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-foreground">{description}</span>
          <Badge variant={meta.badgeVariant} className="shrink-0">
            {meta.label}
          </Badge>
        </div>
        <p className="text-muted-foreground">{result.detail}</p>
      </div>
    </div>
  );
}

/** Groups results into Violation / Warning / Exempted / Pass, most-severe first, with passes collapsed by default (hierarchy.consistent-spacing-grouping, information density — don't show everything by default). */
function HierarchyReport({ results }: { readonly results: readonly RuleResult[] }) {
  const violations = results.filter((r) => r.status === 'violation');
  const warnings = results.filter((r) => r.status === 'warning');
  const exempted = results.filter((r) => r.status === 'exempted');
  const passes = results.filter((r) => r.status === 'pass');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="destructive">{violations.length} violation{violations.length === 1 ? '' : 's'}</Badge>
        <Badge variant="warning">{warnings.length} warning{warnings.length === 1 ? '' : 's'}</Badge>
        <Badge variant="highlight">{exempted.length} exempted</Badge>
        <Badge variant="success">{passes.length} pass{passes.length === 1 ? '' : 'es'}</Badge>
      </div>

      {violations.length > 0 ? (
        <div className="flex flex-col gap-2">
          {violations.map((result, i) => (
            <HierarchyResultRow key={`${result.ruleId}-${i}`} result={result} />
          ))}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="flex flex-col gap-2">
          {warnings.map((result, i) => (
            <HierarchyResultRow key={`${result.ruleId}-${i}`} result={result} />
          ))}
        </div>
      ) : null}

      {exempted.length > 0 ? (
        <div className="flex flex-col gap-2">
          {exempted.map((result, i) => (
            <HierarchyResultRow key={`${result.ruleId}-${i}`} result={result} />
          ))}
        </div>
      ) : null}

      {passes.length > 0 ? (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="group/trigger w-fit gap-1.5 px-1.5 text-muted-foreground">
              <ChevronRightIcon aria-hidden="true" className="size-3.5 transition-transform group-data-[state=open]/trigger:rotate-90" />
              Show {passes.length} passing check{passes.length === 1 ? '' : 's'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2 pt-2">
            {passes.map((result, i) => (
              <HierarchyResultRow key={`${result.ruleId}-${i}`} result={result} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
}

export function ThemeSettingsPanel() {
  const { draft, committed, isDirty, resetAll, commit, resetToGrapheneDefaults } = useThemeConfig();
  const { resolvedTheme, setMode } = useTheme();
  useApplyThemeDraft(draft, resolvedTheme);
  const [open, setOpen] = useState(false);
  // Re-resolve whenever the draft OR the light/dark mode changes — Graphene's
  // light/dark tokens have different values, so switching modes changes every result.
  const contrastResults = useContrastReport(`${JSON.stringify(draft)}::${resolvedTheme}`, CORE_PAIRS);
  const hierarchyResults = useHierarchyReport(contrastResults);

  const allContrastPass = contrastResults.length > 0 && contrastResults.every((r) => r.pass);
  const hierarchyViolationCount = hierarchyResults.filter((r) => r.status === 'violation').length;
  const hierarchyWarningCount = hierarchyResults.filter((r) => r.status === 'warning').length;
  const canSave = allContrastPass && hierarchyViolationCount === 0;
  const failingCount = contrastResults.filter((r) => !r.pass).length + hierarchyViolationCount;

  const hasAnyOverrides = Object.keys(draft).length > 0 || Object.keys(committed).length > 0;
  const currentModeHasOverrides = Object.values(draft).some((override) => override[resolvedTheme] !== undefined);

  const cssExport = useMemo(() => {
    const lightEntries = Object.entries(draft).filter(([, o]) => o.light !== undefined);
    const darkEntries = Object.entries(draft).filter(([, o]) => o.dark !== undefined);
    if (lightEntries.length === 0 && darkEntries.length === 0) {
      return '/* No overrides yet — adjust a color below. */';
    }
    const blocks: string[] = [];
    if (lightEntries.length > 0) {
      blocks.push(`:root {\n${lightEntries.map(([name, o]) => `  --${name}: ${o.light};`).join('\n')}\n}`);
    }
    if (darkEntries.length > 0) {
      blocks.push(`.dark {\n${darkEntries.map(([name, o]) => `  --${name}: ${o.dark};`).join('\n')}\n}`);
    }
    return blocks.join('\n\n');
  }, [draft]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontalIcon aria-hidden="true" />
          Theme settings
          {isDirty ? <Badge variant="secondary">Unsaved</Badge> : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Theme settings</SheetTitle>
          <SheetDescription>
            Changes preview instantly across every example page. Saving is blocked while any violation below is unresolved
            — warnings need review but don't block saving.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-6 py-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Colors &amp; contrast</h2>
                <Button variant="ghost" size="sm" onClick={() => resetAll(resolvedTheme)} disabled={!currentModeHasOverrides}>
                  Reset all
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={resolvedTheme}
                  onValueChange={(v) => {
                    if (v) setMode(v as ResolvedTheme);
                  }}
                >
                  <ToggleGroupItem value="light" aria-label="Edit light theme colors">
                    Light
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" aria-label="Edit dark theme colors">
                    Dark
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-xs text-muted-foreground">Editing {resolvedTheme} colors — each mode has its own.</p>
              </div>
              {contrastResults.map((result) => (
                <ContrastPairRow key={result.pair.id} result={result} />
              ))}
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-foreground">Hierarchy guardrails</h2>
              <HierarchyReport results={hierarchyResults} />
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-foreground">Export as CSS</h2>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">{cssExport}</pre>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-col gap-2 border-t border-border">
          {!canSave ? (
            <p className="flex items-center gap-2 text-xs text-destructive">
              <TriangleAlertIcon aria-hidden="true" className="shrink-0" />
              {failingCount} check{failingCount === 1 ? '' : 's'} failing — cannot save until resolved.
            </p>
          ) : hierarchyWarningCount > 0 ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <TriangleAlertIcon aria-hidden="true" className="shrink-0 text-warning" />
              {hierarchyWarningCount} warning{hierarchyWarningCount === 1 ? '' : 's'} need review but won't block saving.
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={resetToGrapheneDefaults} disabled={!hasAnyOverrides}>
              <RefreshCwIcon aria-hidden="true" />
              Reset to Graphene defaults
            </Button>
            <Button className="flex-1" onClick={commit} disabled={!canSave || !isDirty}>
              Save theme
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
