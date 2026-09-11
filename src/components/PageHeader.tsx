import type { ReactNode } from 'react';

import { useRegisterGuardrailFact } from '../rules/runtimeFacts';

interface PageHeaderProps {
  /** Usually plain text. Accepts ReactNode so a page can swap the title for an inline edit control (e.g. an Input) without changing PageHeader itself. */
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
}

/** The single page-level title for an example page (hierarchy.single-h1). One weight, always text-2xl/semibold, never improvised per page. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  useRegisterGuardrailFact({ kind: 'page-header' });
  useRegisterGuardrailFact({ kind: 'heading', level: 1 });

  return (
    <header className="flex items-start justify-between gap-4 pb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
