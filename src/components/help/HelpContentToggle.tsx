import { Toggle } from '@gravitee/graphene-core';
import { CircleHelpIcon } from '@gravitee/graphene-core/icons';

import { useHelpContent } from './HelpContentContext';

/** Single switch that shows or hides every HelpCallout across the example pages. */
export function HelpContentToggle() {
  const { enabled, toggle } = useHelpContent();

  return (
    <Toggle
      variant="outline"
      size="sm"
      pressed={enabled}
      onPressedChange={toggle}
      aria-label={enabled ? 'Hide helpful content' : 'Show helpful content'}
      className="gap-1.5 px-2.5"
    >
      <CircleHelpIcon aria-hidden="true" className="size-4" />
      {enabled ? 'Hide help' : 'Show help'}
    </Toggle>
  );
}
