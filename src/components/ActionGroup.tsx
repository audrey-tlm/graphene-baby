import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gravitee/graphene-core';
import type { LucideIcon } from '@gravitee/graphene-core/icons';
import { MoreHorizontalIcon } from '@gravitee/graphene-core/icons';
import { Fragment, isValidElement, type ReactElement } from 'react';

import { DeclaredIntent } from './DeclaredIntent';
import { useRegisterGuardrailFact } from '../rules/runtimeFacts';

/** Unwraps a DeclaredIntent declaration so callers can still declare component intent on a primary/secondary slot. */
function unwrapDeclaredIntent(element: ReactElement | undefined): ReactElement | undefined {
  if (element && isValidElement(element) && element.type === DeclaredIntent) {
    const children = (element.props as { children?: unknown }).children;
    if (isValidElement(children)) return children;
  }
  return element;
}

/** Reads a Button's `variant` prop off an already-built element, for guardrail fact reporting. */
function readVariant(element: ReactElement | undefined): string | undefined {
  const unwrapped = unwrapDeclaredIntent(element);
  if (!unwrapped || !isValidElement(unwrapped)) return undefined;
  const props = unwrapped.props as { variant?: string };
  return props.variant;
}

export interface ActionGroupOverflowItem {
  readonly key: string;
  readonly label: string;
  readonly icon?: LucideIcon;
  readonly onClick?: () => void;
  readonly variant?: 'default' | 'destructive';
  /** Renders a menu separator directly above this item — use to set less-frequent or destructive actions apart. */
  readonly separatorBefore?: boolean;
}

interface ActionGroupProps {
  /** The single primary action for this group. One prop slot, not a list — competing primaries can't be written. */
  readonly primary?: ReactElement;
  /** The single most important secondary action, shown next to primary. Anything beyond these two visible actions belongs in `overflow`. */
  readonly secondary?: ReactElement;
  /** Less-frequent or destructive actions, collapsed behind a single "…" menu so the header never grows past two visible buttons. */
  readonly overflow?: readonly ActionGroupOverflowItem[];
  readonly className?: string;
}

/**
 * Groups a page or section's actions with an explicit primary/secondary/overflow distinction
 * (hierarchy.max-two-header-actions). At most two actions are ever visible — primary and
 * secondary are single slots, not lists, so a third action can only be added via `overflow`,
 * which renders behind a "…" trigger instead of competing for space. Also reports each
 * element's `variant` as a guardrail fact, for hierarchy.primary-stronger-emphasis and
 * hierarchy.destructive-not-primary-emphasis to check.
 */
export function ActionGroup({ primary, secondary, overflow = [], className }: ActionGroupProps) {
  useRegisterGuardrailFact({
    kind: 'action-group',
    primaryCount: primary ? 1 : 0,
    hasSecondary: secondary !== undefined,
    primaryVariant: readVariant(primary),
    secondaryVariant: readVariant(secondary),
    overflowCount: overflow.length,
    overflowHasUnseparatedDestructive: overflow.some((item) => item.variant === 'destructive' && !item.separatorBefore),
  });

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      {overflow.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More actions">
              <MoreHorizontalIcon aria-hidden="true" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflow.map((item) => (
              <Fragment key={item.key}>
                {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem variant={item.variant} onSelect={item.onClick}>
                  {item.icon ? <item.icon aria-hidden="true" className="size-3.5" /> : null}
                  {item.label}
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {secondary}
      {primary}
    </div>
  );
}
