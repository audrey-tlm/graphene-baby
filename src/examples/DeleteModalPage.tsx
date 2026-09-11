import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@gravitee/graphene-core';
import { PlusIcon, ShieldCheckIcon, Trash2Icon, WebhookIcon } from '@gravitee/graphene-core/icons';
import { useState } from 'react';

import { ActionGroup } from '../components/ActionGroup';
import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';

interface Webhook {
  readonly id: string;
  readonly name: string;
  readonly url: string;
}

const INITIAL_WEBHOOKS: Webhook[] = [
  { id: 'wh_1', name: 'Deploy notifications', url: 'https://hooks.example.com/deploy' },
  { id: 'wh_2', name: 'Incident alerts', url: 'https://hooks.example.com/incidents' },
  { id: 'wh_3', name: 'Billing events', url: 'https://hooks.example.com/billing' },
];

export function DeleteModalPage() {
  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);
  const [pendingDelete, setPendingDelete] = useState<Webhook | null>(null);

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    setWebhooks((current) => current.filter((webhook) => webhook.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Webhooks"
        description="Outbound endpoints notified when project events occur."
        actions={
          <ActionGroup
            primary={
              <Button>
                <PlusIcon aria-hidden="true" />
                Add webhook
              </Button>
            }
          />
        }
      />

      <HelpCallout icon={ShieldCheckIcon} title="Why deleting asks you to confirm">
        Removing a webhook stops it from receiving events immediately, and any automation relying on it will start
        failing. The confirmation dialog gives you one more moment to double-check the name and URL before it's gone.
      </HelpCallout>

      <Card>
        <CardContent className="pt-6">
          {webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No webhooks configured.</p>
          ) : (
            <ItemGroup>
              {webhooks.map((webhook, i) => (
                <div key={webhook.id}>
                  {i > 0 ? <ItemSeparator /> : null}
                  <Item>
                    <ItemMedia variant="icon">
                      <WebhookIcon aria-hidden="true" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{webhook.name}</ItemTitle>
                      <ItemDescription>{webhook.url}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Delete ${webhook.name}`}
                        onClick={() => setPendingDelete(webhook)}
                      >
                        <Trash2Icon aria-hidden="true" className="size-4" />
                      </Button>
                    </ItemActions>
                  </Item>
                </div>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete webhook?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `This will permanently remove "${pendingDelete.name}". Events will no longer be sent to this endpoint.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2Icon aria-hidden="true" />
              Delete webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
