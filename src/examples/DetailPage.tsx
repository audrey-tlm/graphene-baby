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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@gravitee/graphene-core';
import {
  ArchiveIcon,
  CopyIcon,
  DownloadIcon,
  LayersIcon,
  PencilIcon,
  RocketIcon,
  Trash2Icon,
  XIcon,
} from '@gravitee/graphene-core/icons';
import { useState } from 'react';

import { ActionGroup } from '../components/ActionGroup';
import { ContentText } from '../components/ContentText';
import { DeclaredIntent } from '../components/DeclaredIntent';
import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';
import { Section, FocalPoint } from '../components/Section';
import { SectionHeader } from '../components/SectionHeader';
import { Stack } from '../components/Stack';
import type { StatusValue } from '../components/Status';
import { Status } from '../components/Status';

type ProjectStatus = 'active' | 'inactive' | 'draft';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
};

/** Guardrail 5 — Status's `status` prop only accepts Graphene's semantic Badge tokens, so "draft" maps to the neutral one rather than an arbitrary color. */
const STATUS_VALUE: Record<ProjectStatus, StatusValue> = {
  active: 'success',
  inactive: 'secondary',
  draft: 'secondary',
};

const ENVIRONMENTS = ['Production', 'Staging', 'Development'];

interface ProjectDraft {
  readonly name: string;
  readonly status: ProjectStatus;
  readonly environment: string;
  readonly region: string;
}

const PROJECT_ID = 'proj_8f2a1c';
const CREATED_ON = 'March 12, 2026';

const INITIAL_PROJECT: ProjectDraft = {
  name: 'Gamma Portal',
  status: 'active',
  environment: 'Production',
  region: 'eu-west-1',
};

const MEMBERS = [
  { name: 'Alex Chen', role: 'Owner' },
  { name: 'Priya Nair', role: 'Maintainer' },
  { name: 'Sam Okafor', role: 'Viewer' },
];

export function DetailPage() {
  const [project, setProject] = useState<ProjectDraft>(INITIAL_PROJECT);
  const [draft, setDraft] = useState<ProjectDraft>(INITIAL_PROJECT);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const isEditing = mode === 'edit';

  function handleStartEdit() {
    setDraft(project);
    setMode('edit');
  }

  function handleSave() {
    setProject(draft);
    setMode('view');
  }

  function handleCancel() {
    setMode('view');
  }

  return (
    <Section focalPoint="project-name" className="flex flex-col gap-6">
      <PageHeader
        title={
          isEditing ? (
            <FocalPoint name="project-name">
              <Input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                aria-label="Project name"
                className="h-9 max-w-sm text-2xl font-semibold"
              />
            </FocalPoint>
          ) : (
            <FocalPoint name="project-name">{project.name}</FocalPoint>
          )
        }
        description={
          isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{draft.environment} project</span>
              <Select
                value={draft.status}
                onValueChange={(value) => setDraft((d) => ({ ...d, status: value as ProjectStatus }))}
              >
                <SelectTrigger size="sm" className="h-7 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <span className="inline-flex items-center gap-2">
              {project.environment} project
              <Status status={STATUS_VALUE[project.status]} label={STATUS_LABEL[project.status]} />
            </span>
          )
        }
        actions={
          isEditing ? (
            <ActionGroup
              primary={
                <DeclaredIntent component="Button" intent="action">
                  <Button onClick={handleSave}>Save changes</Button>
                </DeclaredIntent>
              }
              secondary={
                <Button variant="outline" onClick={handleCancel}>
                  <XIcon aria-hidden="true" />
                  Cancel
                </Button>
              }
            />
          ) : (
            <ActionGroup
              primary={
                <Button onClick={handleStartEdit}>
                  <PencilIcon aria-hidden="true" />
                  Edit
                </Button>
              }
              secondary={
                <Button variant="outline">
                  <RocketIcon aria-hidden="true" />
                  Deploy
                </Button>
              }
              overflow={[
                { key: 'duplicate', label: 'Duplicate', icon: CopyIcon },
                { key: 'archive', label: 'Archive', icon: ArchiveIcon },
                { key: 'export', label: 'Export', icon: DownloadIcon },
                {
                  key: 'delete',
                  label: 'Delete project',
                  icon: Trash2Icon,
                  variant: 'destructive',
                  separatorBefore: true,
                  onClick: () => setConfirmDeleteOpen(true),
                },
              ]}
            />
          )
        }
      />

      <HelpCallout icon={LayersIcon} title="Finding your way around">
        Overview, Settings, and Members are grouped into tabs so related details stay together without crowding the
        page. Edit switches Details into editable fields — Duplicate, Archive, Export, and Delete live in the "…"
        menu since they're used far less often.
      </HelpCallout>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6 pt-4">
          <div>
            <SectionHeader title="Details" />
            <Card>
              <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
                <Stack relationship="related" gap="gap-1">
                  <ContentText contentRole="metadata" as="span" className="text-xs text-muted-foreground">
                    Project ID
                  </ContentText>
                  <ContentText contentRole="secondary" as="span" className="text-sm text-foreground">
                    {PROJECT_ID}
                  </ContentText>
                </Stack>

                <Stack relationship="related" gap="gap-1">
                  <ContentText contentRole="metadata" as="span" className="text-xs text-muted-foreground">
                    Environment
                  </ContentText>
                  {isEditing ? (
                    <Select
                      value={draft.environment}
                      onValueChange={(value) => setDraft((d) => ({ ...d, environment: value }))}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVIRONMENTS.map((environment) => (
                          <SelectItem key={environment} value={environment}>
                            {environment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <ContentText contentRole="secondary" as="span" className="text-sm text-foreground">
                      {project.environment}
                    </ContentText>
                  )}
                </Stack>

                <Stack relationship="related" gap="gap-1">
                  <ContentText contentRole="metadata" as="span" className="text-xs text-muted-foreground">
                    Region
                  </ContentText>
                  {isEditing ? (
                    <Input
                      value={draft.region}
                      onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
                      className="h-8"
                    />
                  ) : (
                    <ContentText contentRole="secondary" as="span" className="text-sm text-foreground">
                      {project.region}
                    </ContentText>
                  )}
                </Stack>

                <Stack relationship="related" gap="gap-1">
                  <ContentText contentRole="metadata" as="span" className="text-xs text-muted-foreground">
                    Created
                  </ContentText>
                  <ContentText contentRole="secondary" as="span" className="text-sm text-foreground">
                    {CREATED_ON}
                  </ContentText>
                </Stack>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex flex-col gap-6 pt-4">
          <SectionHeader title="Settings" description="Only visible in the Settings tab of this example." />
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Settings for this example live on the dedicated Form/Settings page — see the sidebar.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="flex flex-col gap-6 pt-4">
          <SectionHeader title="Members" description="People with access to this project." />
          <Card>
            <CardContent className="flex flex-col pt-6">
              {MEMBERS.map((member, i) => (
                <div key={member.name}>
                  {i > 0 ? <Separator className="my-3" /> : null}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{member.name}</span>
                    <span className="text-muted-foreground">{member.role}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {project.name}?</DialogTitle>
            <DialogDescription>
              This will permanently remove this project and all of its data. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => setConfirmDeleteOpen(false)}>
              <Trash2Icon aria-hidden="true" />
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
