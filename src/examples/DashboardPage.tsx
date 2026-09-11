import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  PortalContainerProvider,
} from '@gravitee/graphene-core';
import type { LucideIcon } from '@gravitee/graphene-core/icons';
import {
  ArrowUpIcon,
  GitBranchIcon,
  MessageSquareIcon,
  OctagonXIcon,
  PlusIcon,
  RocketIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UserCheckIcon,
  UsersIcon,
  WebhookIcon,
} from '@gravitee/graphene-core/icons';
import type { CSSProperties } from 'react';

import { ActionGroup } from '../components/ActionGroup';
import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';

/**
 * Gravitee brand treatment (picked from 3 explorations — see git history for the
 * other 2 directions considered). Keeps Graphene's light neutral base, but hover
 * and secondary surfaces carry a hint of brand orange instead of plain gray.
 * `PortalContainerProvider` keeps portaled menus (Quick actions' "…" overflow)
 * inside this scope so they pick up the tint too, instead of the app's ambient theme.
 */
const BRAND_STYLE = {
  '--secondary-foreground': 'var(--graphene-solaris-800)',
  '--accent': 'var(--graphene-solaris-100)',
} as CSSProperties;

type StatStatus = 'success' | 'warning' | 'destructive' | 'secondary';

interface Stat {
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly status: StatStatus;
  readonly deltaIcon?: LucideIcon;
}

const STATS: Stat[] = [
  { label: 'Active projects', value: '24', delta: '+3 this week', status: 'success', deltaIcon: ArrowUpIcon },
  { label: 'Team members', value: '12', delta: 'Steady this week', status: 'secondary' },
  { label: 'Open issues', value: '7', delta: '+2 this week', status: 'warning', deltaIcon: ArrowUpIcon },
  { label: 'Failed deployments', value: '1', delta: 'Needs attention', status: 'destructive', deltaIcon: TriangleAlertIcon },
];

type ActivityStatus = { readonly label: string; readonly variant: 'success' | 'destructive' | 'secondary' | 'outline' };

interface ActivityItem {
  readonly id: string;
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description?: string;
  readonly status: ActivityStatus;
  readonly when: string;
}

const ACTIVITY: ActivityItem[] = [
  {
    id: 'deploy',
    icon: RocketIcon,
    title: 'Alex Chen deployed gamma-portal to production',
    description: 'Build #482 · 1m 42s',
    status: { label: 'Deployed', variant: 'success' },
    when: '12 minutes ago',
  },
  {
    id: 'ci-failed',
    icon: OctagonXIcon,
    title: 'CI failed for API Management',
    description: 'fix/rate-limit-retry · 3 tests failed in checkout.spec.ts',
    status: { label: 'Failed', variant: 'destructive' },
    when: '45 minutes ago',
  },
  {
    id: 'merge',
    icon: GitBranchIcon,
    title: 'Priya Nair merged feat/theme-tokens',
    description: 'Into main · 6 files changed',
    status: { label: 'Merged', variant: 'secondary' },
    when: '1 hour ago',
  },
  {
    id: 'comment',
    icon: MessageSquareIcon,
    title: 'Jordan Lee commented on API Management #482',
    description: '"Can we bump the timeout before this ships? Seeing timeouts locally."',
    status: { label: 'Comment', variant: 'outline' },
    when: '3 hours ago',
  },
  {
    id: 'invite',
    icon: UserCheckIcon,
    title: 'Sam Okafor invited 2 teammates',
    description: 'To Observability Dashboard v2',
    status: { label: 'Invited', variant: 'success' },
    when: 'yesterday',
  },
];

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8" style={BRAND_STYLE}>
      <PortalContainerProvider>
        <PageHeader
          title="Dashboard"
          description="A quick look at your workspace — what's active, what changed, and where to go next."
          actions={
            <ActionGroup
              primary={
                <Button>
                  <PlusIcon aria-hidden="true" />
                  New project
                </Button>
              }
              secondary={
                <Button variant="outline">
                  <UsersIcon aria-hidden="true" />
                  Invite team
                </Button>
              }
            />
          }
        />

        <HelpCallout icon={SparklesIcon} title="Reading this dashboard">
          Metric badges compare each number to last week — green is healthy, amber is worth a look, red needs
          attention. Recent activity lists what changed across the workspace, and quick actions below get you to
          common tasks faster.
        </HelpCallout>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => {
            const DeltaIcon = stat.deltaIcon;
            return (
              <Card key={stat.label}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                  <Badge variant={stat.status} className="gap-1">
                    {DeltaIcon ? <DeltaIcon aria-hidden="true" className="size-3" /> : null}
                    {stat.delta}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <SectionHeader title="Recent activity" description="What changed across your projects, most recent first." />
          <Card>
            <CardContent className="pt-6">
              <ItemGroup>
                {ACTIVITY.map((item, i) => (
                  <div key={item.id}>
                    {i > 0 ? <ItemSeparator /> : null}
                    <Item>
                      <ItemMedia variant="icon">
                        <item.icon aria-hidden="true" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{item.title}</ItemTitle>
                        {item.description ? <ItemDescription>{item.description}</ItemDescription> : null}
                      </ItemContent>
                      <ItemActions className="flex flex-col items-end gap-1.5">
                        <Badge variant={item.status.variant}>{item.status.label}</Badge>
                        <span className="text-xs text-muted-foreground">{item.when}</span>
                      </ItemActions>
                    </Item>
                  </div>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        </div>

        <div>
          <SectionHeader title="Quick actions" description="Common next steps for this workspace." />
          <ActionGroup
            primary={
              <Button>
                <WebhookIcon aria-hidden="true" />
                Add webhook
              </Button>
            }
            secondary={
              <Button variant="outline">
                <SlidersHorizontalIcon aria-hidden="true" />
                Configure a connector
              </Button>
            }
            overflow={[{ key: 'settings', label: 'Review settings', icon: SettingsIcon }]}
          />
        </div>
      </PortalContainerProvider>
    </div>
  );
}
