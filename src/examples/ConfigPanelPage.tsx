import {
  Badge,
  Button,
  Card,
  CardContent,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  Input,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from '@gravitee/graphene-core';
import { CableIcon, CircleHelpIcon, PlusIcon, SlidersHorizontalIcon } from '@gravitee/graphene-core/icons';
import { useId, useState } from 'react';

import { ActionGroup } from '../components/ActionGroup';
import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';

type ConnectorStatus = 'connected' | 'not configured';

interface Connector {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly status: ConnectorStatus;
}

const INITIAL_CONNECTORS: Connector[] = [
  { id: 'github', name: 'GitHub', type: 'Source control', status: 'connected' },
  { id: 'slack', name: 'Slack', type: 'Messaging', status: 'connected' },
  { id: 'pagerduty', name: 'PagerDuty', type: 'Alerting', status: 'not configured' },
];

export function ConfigPanelPage() {
  const [connectors, setConnectors] = useState(INITIAL_CONNECTORS);
  const [activeConnectorId, setActiveConnectorId] = useState<string | null>(null);
  const endpointId = useId();
  const enabledId = useId();

  const activeConnector = connectors.find((connector) => connector.id === activeConnectorId) ?? null;

  function handleSave() {
    if (!activeConnectorId) return;
    setConnectors((current) =>
      current.map((connector) => (connector.id === activeConnectorId ? { ...connector, status: 'connected' } : connector)),
    );
    setActiveConnectorId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Connectors"
        description="Third-party services this project can send events to."
        actions={
          <ActionGroup
            primary={
              <Button>
                <PlusIcon aria-hidden="true" />
                Add connector
              </Button>
            }
          />
        }
      />

      <HelpCallout icon={CircleHelpIcon} title="Configure without losing your place">
        Configure opens a panel over this list instead of a new page, so you can tune a connector's settings and get
        straight back to comparing it with the others. Turning Enabled off pauses a connector without deleting it.
      </HelpCallout>

      <Card>
        <CardContent className="pt-6">
          <ItemGroup>
            {connectors.map((connector, i) => (
              <div key={connector.id}>
                {i > 0 ? <ItemSeparator /> : null}
                <Item>
                  <ItemMedia variant="icon">
                    <CableIcon aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{connector.name}</ItemTitle>
                    <ItemDescription>{connector.type}</ItemDescription>
                  </ItemContent>
                  <ItemActions className="flex items-center gap-3">
                    <Badge variant={connector.status === 'connected' ? 'success' : 'outline'}>{connector.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => setActiveConnectorId(connector.id)}>
                      <SlidersHorizontalIcon aria-hidden="true" className="size-3.5" />
                      Configure
                    </Button>
                  </ItemActions>
                </Item>
              </div>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>

      <Sheet open={activeConnector !== null} onOpenChange={(open) => !open && setActiveConnectorId(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Configure {activeConnector?.name}</SheetTitle>
            <SheetDescription>Update connection settings for this connector.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-4">
            <Field>
              <FieldContent>
                <FieldLabel htmlFor={endpointId}>Webhook URL</FieldLabel>
                <FieldDescription>Where events for this connector are delivered.</FieldDescription>
              </FieldContent>
              <Input id={endpointId} placeholder="https://" defaultValue="" />
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel>Sync frequency</FieldLabel>
                <FieldDescription>How often data is pulled from this connector.</FieldDescription>
              </FieldContent>
              <Select defaultValue="15m">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">Every 5 minutes</SelectItem>
                  <SelectItem value="15m">Every 15 minutes</SelectItem>
                  <SelectItem value="1h">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={enabledId}>Enabled</FieldLabel>
                <FieldDescription>Pause without removing the connector.</FieldDescription>
              </FieldContent>
              <Switch id={enabledId} defaultChecked />
            </Field>
          </div>

          <SheetFooter>
            <Button onClick={handleSave}>Save changes</Button>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
