import { cn } from '@gravitee/graphene-core';
import type { ElementType, ReactNode } from 'react';

import type { SpacingRelationship } from '../rules/config/spacing';
import { useRegisterGuardrailFact } from '../rules/runtimeFacts';

interface StackProps {
  /** Declared relationship between the children — checked against SPACING_TOKENS, not judged visually. */
  readonly relationship: SpacingRelationship;
  /** Must be one of the approved gap tokens for `relationship` (see src/rules/config/spacing.ts) — hierarchy.spacing-approved-token flags anything else. */
  readonly gap: string;
  readonly direction?: 'row' | 'col';
  readonly as?: ElementType;
  /** Additional non-spacing classes (e.g. `items-center`). */
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Declares the relationship between a group of children (Guardrail 3) instead
 * of leaving spacing to be picked ad hoc or judged from how far apart things
 * "feel". `gap` must be one of the tokens approved for `relationship`.
 */
export function Stack({ relationship, gap, direction = 'col', as: Tag = 'div', className, children }: StackProps) {
  useRegisterGuardrailFact({ kind: 'spacing', relationship, gapClassName: gap });

  return <Tag className={cn('flex', direction === 'col' ? 'flex-col' : 'flex-row', gap, className)}>{children}</Tag>;
}
