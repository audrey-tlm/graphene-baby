import { Button, Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@gravitee/graphene-core';
import { BookOpenIcon, PlugZapIcon, PlusIcon } from '@gravitee/graphene-core/icons';

import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';

export function EmptyStatePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Integrations" description="Connect external tools to this project." />

      <HelpCallout icon={BookOpenIcon} title="What this page is for" dismissible={false}>
        Integrations let Gamma notify tools your team already uses — post a Slack message on deploy, open a GitHub
        issue when a build breaks, and more. Add your first one below; each integration can be reconfigured or
        removed later from this same page.
      </HelpCallout>

      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PlugZapIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No integrations yet</EmptyTitle>
          <EmptyDescription>Connect a tool like GitHub or Slack to start syncing activity.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <PlusIcon aria-hidden="true" />
            Add integration
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
