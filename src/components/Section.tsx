import { useId, type ReactNode } from 'react';

import { SectionKeyProvider, useRegisterGuardrailFact, useSectionKey } from '../rules/runtimeFacts';

interface SectionProps {
  /** The `name` a `<FocalPoint>` inside this section must declare — checked by hierarchy.single-focal-point. */
  readonly focalPoint: string;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Declares a meaningful page section and its intended focal point (Guardrail 2),
 * instead of asking Claude to judge which element visually attracts the most
 * attention. `sectionKey` is auto-generated (`useId()`) — authors only name the
 * focal point, not the section itself.
 */
export function Section({ focalPoint, className, children }: SectionProps) {
  const sectionKey = useId();
  useRegisterGuardrailFact({ kind: 'section', sectionKey, focalPoint });

  return (
    <SectionKeyProvider value={sectionKey}>
      <div className={className}>{children}</div>
    </SectionKeyProvider>
  );
}

interface FocalPointProps {
  /** Must match the enclosing `<Section>`'s `focalPoint` value. */
  readonly name: string;
  readonly children: ReactNode;
}

/**
 * Marks the element intended as its enclosing `<Section>`'s focal point.
 * Renders no DOM of its own (a Fragment), so it never affects layout or HTML
 * validity — it exists purely to declare intent.
 */
export function FocalPoint({ name, children }: FocalPointProps) {
  const sectionKey = useSectionKey();
  useRegisterGuardrailFact({ kind: 'focal-point', name, sectionKey });

  return <>{children}</>;
}
