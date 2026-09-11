import { Alert, AlertAction, AlertDescription, AlertTitle, Button } from '@gravitee/graphene-core';
import type { LucideIcon } from '@gravitee/graphene-core/icons';
import { XIcon } from '@gravitee/graphene-core/icons';
import { useState, type ReactNode } from 'react';

import { useHelpContent } from './HelpContentContext';

interface HelpCalloutProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly children: ReactNode;
  /** Empty-state guidance stays up as long as "Helpful content" is on — set false to omit the dismiss control. Defaults to true. */
  readonly dismissible?: boolean;
  readonly className?: string;
}

/**
 * Contextual tip shown when "Helpful content" mode is on (see HelpContentContext).
 * Unmounting on toggle-off — rather than hiding via CSS — is what makes a dismissed
 * tip come back the next time the mode is switched back on (see HelpCalloutBody).
 */
export function HelpCallout({ icon, title, children, dismissible = true, className }: HelpCalloutProps) {
  const { enabled } = useHelpContent();
  if (!enabled) return null;
  return <HelpCalloutBody icon={icon} title={title} dismissible={dismissible} className={className}>{children}</HelpCalloutBody>;
}

function HelpCalloutBody({
  icon: Icon,
  title,
  children,
  dismissible,
  className,
}: Required<Pick<HelpCalloutProps, 'dismissible'>> & Omit<HelpCalloutProps, 'dismissible'>) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <Alert className={`flex-row items-start gap-3 ${className ?? ''}`}>
      <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
      <div className="flex flex-col gap-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{children}</AlertDescription>
      </div>
      {dismissible ? (
        <AlertAction align="top">
          <Button variant="ghost" size="icon-xs" aria-label="Dismiss helpful content" onClick={() => setDismissed(true)}>
            <XIcon aria-hidden="true" className="size-3.5" />
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  );
}
