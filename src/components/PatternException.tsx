import type { ReactNode } from 'react';

import type { RegisteredPattern } from '../rules/config/patternRegistry';
import { useRegisterGuardrailFact } from '../rules/runtimeFacts';

interface PatternExceptionProps {
  /** Must be a key in PATTERN_REGISTRY — a typo here is a type error, not a silent no-op. */
  readonly pattern: RegisteredPattern;
  /** Why this spot doesn't reuse PATTERN_REGISTRY[pattern]'s canonical component. A blank reason is a violation, not an exemption. */
  readonly reason: string;
  readonly children: ReactNode;
}

/**
 * Documents an intentional deviation from an established pattern (Guardrail 7).
 * This can only confirm a *declared* exception carries a real reason — it
 * cannot detect an *undeclared* one-off; see src/rules/config/patternRegistry.ts
 * for why that's out of scope by design, not an oversight.
 */
export function PatternException({ pattern, reason, children }: PatternExceptionProps) {
  useRegisterGuardrailFact({ kind: 'pattern-exception', pattern, reason });

  return <>{children}</>;
}
