import { Badge } from '@gravitee/graphene-core';
import type { LucideIcon } from '@gravitee/graphene-core/icons';

import { useRegisterGuardrailFact } from '../rules/runtimeFacts';

export type StatusValue = 'success' | 'warning' | 'destructive' | 'highlight' | 'secondary';

interface StatusBaseProps {
  /** Semantic status — maps 1:1 to a Graphene Badge token, never a raw color (hierarchy.status-semantic-token). */
  readonly status: StatusValue;
  readonly className?: string;
}

// A union, not `label?: string; icon?: LucideIcon`, so omitting both is a type
// error — "at least one non-color indicator" (Guardrail 5) enforced by
// construction, the same way ActionGroup's primary/secondary slots are.
type StatusProps =
  | (StatusBaseProps & { readonly label: string; readonly icon?: LucideIcon })
  | (StatusBaseProps & { readonly label?: string; readonly icon: LucideIcon });

const STATUS_BADGE_VARIANT: Record<StatusValue, 'success' | 'warning' | 'destructive' | 'highlight' | 'secondary'> = {
  success: 'success',
  warning: 'warning',
  destructive: 'destructive',
  highlight: 'highlight',
  secondary: 'secondary',
};

/**
 * Declares a status explicitly (Guardrail 5) instead of communicating it
 * through color alone. `label`/`icon` are typed so at least one must be
 * provided — hierarchy.status-non-color-indicator can never actually fail,
 * but still reports so the panel shows every declared status, not just
 * ones that happen to break a rule.
 */
export function Status({ status, label, icon: Icon, className }: StatusProps) {
  useRegisterGuardrailFact({ kind: 'status', status, hasLabel: Boolean(label), hasIcon: Icon !== undefined });

  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]} className={className}>
      {Icon ? <Icon aria-hidden="true" className="size-3" /> : null}
      {label}
    </Badge>
  );
}
