import {
  Button,
  Card,
  CardContent,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@gravitee/graphene-core';
import { InfoIcon, Trash2Icon } from '@gravitee/graphene-core/icons';
import { useId } from 'react';

import { ActionGroup } from '../components/ActionGroup';
import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';

export function SettingsFormPage() {
  const nameId = useId();
  const notificationsId = useId();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" description="Manage general configuration for this project." />

      <HelpCallout icon={InfoIcon} title="Before you change these">
        General settings apply to everyone on this project immediately after you save. Actions in the danger zone
        below skip that safety net entirely — they take effect the moment you confirm them and can't be undone.
      </HelpCallout>

      <div>
        <SectionHeader title="General" description="Basic information about this project." />
        <Card>
          <CardContent className="flex flex-col gap-6 pt-6">
            <Field>
              <FieldContent>
                <FieldLabel htmlFor={nameId}>Project name</FieldLabel>
                <FieldDescription>Shown across the dashboard and in notifications.</FieldDescription>
              </FieldContent>
              <Input id={nameId} defaultValue="Gamma Portal" />
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel>Plan</FieldLabel>
                <FieldDescription>Controls usage limits and available features.</FieldDescription>
              </FieldContent>
              <Select defaultValue="pro">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={notificationsId}>Email notifications</FieldLabel>
                <FieldDescription>Get notified about deployments and team activity.</FieldDescription>
              </FieldContent>
              <Switch id={notificationsId} defaultChecked />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div>
        <SectionHeader title="Danger zone" description="These actions are difficult or impossible to undo." />
        <Card>
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-foreground">Delete this project</Label>
              <p className="text-sm text-muted-foreground">Permanently remove this project and all of its data.</p>
            </div>
            <Button variant="destructive">
              <Trash2Icon aria-hidden="true" />
              Delete project
            </Button>
          </CardContent>
        </Card>
      </div>

      <ActionGroup
        className="justify-end"
        primary={<Button>Save changes</Button>}
        secondary={
          <Button variant="outline">
            Cancel
          </Button>
        }
      />
    </div>
  );
}
