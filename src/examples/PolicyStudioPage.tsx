import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@gravitee/graphene-core';
import type { LucideIcon } from '@gravitee/graphene-core/icons';
import {
  ArrowDownIcon,
  CopyIcon,
  DownloadIcon,
  FilterIcon,
  GitBranchIcon,
  KeyIcon,
  MoreVerticalIcon,
  PlusIcon,
  Trash2Icon,
  WaypointsIcon,
  ZapIcon,
} from '@gravitee/graphene-core/icons';

import { ActionGroup } from '../components/ActionGroup';
import { ContentText } from '../components/ContentText';
import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';
import { Section, FocalPoint } from '../components/Section';
import { Stack } from '../components/Stack';
import { Status } from '../components/Status';

interface PolicyStep {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly enabled: boolean;
}

const REQUEST_POLICIES: readonly PolicyStep[] = [
  {
    id: 'key-validation',
    name: 'API key validation',
    description: 'Rejects requests without a valid API key.',
    icon: KeyIcon,
    enabled: true,
  },
  {
    id: 'rate-limiting',
    name: 'Rate limiting',
    description: '100 requests/min per application.',
    icon: ZapIcon,
    enabled: true,
  },
  {
    id: 'header-transform',
    name: 'Header transformation',
    description: 'Adds X-Gateway-Version to the upstream request.',
    icon: FilterIcon,
    enabled: false,
  },
];

function PolicyStepCard({ step, isLast }: { readonly step: PolicyStep; readonly isLast: boolean }) {
  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <step.icon aria-hidden="true" className="size-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ContentText contentRole="primary" as="span" className="text-sm font-medium text-foreground">
              {step.name}
            </ContentText>
            <ContentText contentRole="metadata" as="span" className="text-xs text-muted-foreground">
              {step.description}
            </ContentText>
          </div>
          <Status status={step.enabled ? 'success' : 'secondary'} label={step.enabled ? 'Enabled' : 'Disabled'} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`${step.name} actions`}>
                <MoreVerticalIcon aria-hidden="true" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>{step.enabled ? 'Disable' : 'Enable'}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
      {!isLast ? (
        <div className="flex justify-center py-1">
          <ArrowDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
        </div>
      ) : null}
    </div>
  );
}

function PolicyChain({ policies }: { readonly policies: readonly PolicyStep[] }) {
  return (
    <Stack relationship="group" gap="gap-2">
      {policies.map((step, i) => (
        <PolicyStepCard key={step.id} step={step} isLast={i === policies.length - 1} />
      ))}
      <Button variant="outline" className="self-start">
        <PlusIcon aria-hidden="true" />
        Add policy
      </Button>
    </Stack>
  );
}

export function PolicyStudioPage() {
  return (
    <Section focalPoint="flow-name" className="flex flex-col gap-6">
      <PageHeader
        title={<FocalPoint name="flow-name">Default flow</FocalPoint>}
        description={
          <span className="inline-flex items-center gap-2">
            Applies to requests matching <Badge variant="outline">/**</Badge>
          </span>
        }
        actions={
          <ActionGroup
            primary={<Button>Save flow</Button>}
            secondary={
              <Button variant="outline">
                <GitBranchIcon aria-hidden="true" />
                Test flow
              </Button>
            }
            overflow={[
              { key: 'duplicate', label: 'Duplicate flow', icon: CopyIcon },
              { key: 'export', label: 'Export', icon: DownloadIcon },
              {
                key: 'delete',
                label: 'Delete flow',
                icon: Trash2Icon,
                variant: 'destructive',
                separatorBefore: true,
              },
            ]}
          />
        }
      />

      <HelpCallout icon={WaypointsIcon} title="Request and response phases run separately">
        Policies in the request phase run before Gamma forwards the call upstream; response policies run on the way
        back, before the reply reaches the caller. Each phase has its own ordered chain — drag isn't wired up in this
        playground, but the chain, its cards, and the empty state all use the same guardrail-checked components as
        the rest of the app.
      </HelpCallout>

      <Tabs defaultValue="request">
        <TabsList>
          <TabsTrigger value="request">Request phase</TabsTrigger>
          <TabsTrigger value="response">Response phase</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="pt-4">
          <PolicyChain policies={REQUEST_POLICIES} />
        </TabsContent>

        <TabsContent value="response" className="pt-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WaypointsIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No response policies yet</EmptyTitle>
              <EmptyDescription>Add a policy to transform or filter the reply before it reaches the caller.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline">
                <PlusIcon aria-hidden="true" />
                Add policy
              </Button>
            </EmptyContent>
          </Empty>
        </TabsContent>
      </Tabs>
    </Section>
  );
}
