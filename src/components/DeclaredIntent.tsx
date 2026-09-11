import type { ReactNode } from 'react';

import type { RegisteredComponent } from '../rules/config/componentRegistry';
import { useRegisterGuardrailFact } from '../rules/runtimeFacts';

interface DeclaredIntentProps {
  /** Must be a key in COMPONENT_REGISTRY — a typo here is a type error, not a silent no-op. */
  readonly component: RegisteredComponent;
  /** Free string, not narrowed to the "correct" answer — a real mismatch has to be authorable for hierarchy.component-intent-matches-registry to have anything to check. */
  readonly intent: string;
  readonly children: ReactNode;
}

/**
 * Declares why a Graphene component is being used here (Guardrails 4b & 6),
 * instead of asking whether the choice "looks right" for the content. Renders
 * a Fragment — it exists purely to attach a fact to whatever it wraps, same
 * technique as `<FocalPoint>`.
 */
export function DeclaredIntent({ component, intent, children }: DeclaredIntentProps) {
  useRegisterGuardrailFact({ kind: 'component-intent', component, intent });

  return <>{children}</>;
}
