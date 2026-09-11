import type { ReactNode } from 'react';

import { useRegisterGuardrailFact } from '../rules/runtimeFacts';

interface SectionHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}

/** A section title, one visual step below PageHeader (text-lg/medium vs text-2xl/semibold) so page vs section hierarchy stays legible regardless of theme (hierarchy.heading-levels-no-skip). */
export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  useRegisterGuardrailFact({ kind: 'heading', level: 2 });

  return (
    <div className="flex items-start justify-between gap-4 pb-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-medium text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
