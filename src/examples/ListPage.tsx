import {
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  cn,
  DataTableEmptyState,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FacetedFilter,
  Input,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gravitee/graphene-core';
import {
  ArchiveIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleHelpIcon,
  FilterIcon,
  FunnelXIcon,
  GripVerticalIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  XIcon,
} from '@gravitee/graphene-core/icons';
import { useRef, useState } from 'react';

import { ActionGroup } from '../components/ActionGroup';
import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';

type ProjectStatus = 'active' | 'draft' | 'archived';

interface Project {
  readonly id: string;
  readonly name: string;
  readonly status: ProjectStatus;
  readonly owner: string;
  readonly updated: string;
}

const STATUS_VARIANT: Record<ProjectStatus, 'success' | 'secondary' | 'outline'> = {
  active: 'success',
  draft: 'outline',
  archived: 'secondary',
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const OWNERS = ['Alex Chen', 'Priya Nair', 'Jordan Lee', 'Sam Okafor', 'Morgan Diaz', 'Taylor Brooks'];
const OWNER_OPTIONS = OWNERS.map((owner) => ({ value: owner, label: owner }));

const UPDATED_CYCLE = [
  '12 minutes ago',
  '1 hour ago',
  '3 hours ago',
  'yesterday',
  '2 days ago',
  '5 days ago',
  '1 week ago',
  '3 weeks ago',
];

const PROJECT_NAMES = [
  'Portal',
  'API Management',
  'Observability Dashboard',
  'Auth Service',
  'Event Stream Manager',
  'Billing Reconciler',
  'Customer Data Platform',
  'Search Indexer',
  'Notification Hub',
  'Feature Flags',
  'Payments Gateway',
  'Identity Provider',
  'Audit Log Exporter',
  'Rate Limiter',
  'Config Sync Agent',
  'Webhook Relay',
  'Data Warehouse Loader',
  'Session Store',
  'Media Transcoder',
  'Support Portal',
  'Analytics Pipeline',
  'Fraud Detection',
  'Mobile Push Service',
  'Internal CLI Tools',
  'Docs Site',
  'Status Page',
  'Marketing Site',
  'Partner API',
  'Sandbox Environment',
  'Load Test Harness',
  'Chatbot Backend',
  'Recommendation Engine',
  'Inventory Sync',
  'Order Processor',
  'Email Delivery',
  'SSO Gateway',
  'Metrics Collector',
  'Backup Orchestrator',
  'Secrets Manager',
  'Deployment Pipeline',
  'Cost Reporting',
  'Onboarding Flow',
];

// 28 active, 9 draft, 5 archived — deterministic, not randomized.
const INITIAL_PROJECTS: Project[] = PROJECT_NAMES.map((name, i) => ({
  id: `proj-${i + 1}`,
  name,
  status: i < 28 ? 'active' : i < 37 ? 'draft' : 'archived',
  owner: OWNERS[i % OWNERS.length],
  updated: UPDATED_CYCLE[i % UPDATED_CYCLE.length],
}));

type ConditionField = 'name' | 'status' | 'owner' | 'updated';
type ConditionOperator = 'contains' | 'is' | 'is-not';

interface Condition {
  readonly id: string;
  readonly field: ConditionField;
  readonly operator: ConditionOperator;
  readonly value: string;
}

const FIELD_OPTIONS: { value: ConditionField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'owner', label: 'Owner' },
  { value: 'updated', label: 'Updated' },
];

const OPERATORS_BY_FIELD: Record<ConditionField, { value: ConditionOperator; label: string }[]> = {
  name: [{ value: 'contains', label: 'contains' }],
  updated: [{ value: 'contains', label: 'contains' }],
  status: [
    { value: 'is', label: 'is' },
    { value: 'is-not', label: 'is not' },
  ],
  owner: [
    { value: 'is', label: 'is' },
    { value: 'is-not', label: 'is not' },
  ],
};

function defaultOperatorForField(field: ConditionField): ConditionOperator {
  return OPERATORS_BY_FIELD[field][0].value;
}

function defaultValueForField(field: ConditionField): string {
  if (field === 'status') return STATUS_OPTIONS[0].value;
  if (field === 'owner') return OWNER_OPTIONS[0].value;
  return '';
}

function matchesCondition(project: Project, condition: Condition): boolean {
  const needle = condition.value.trim().toLowerCase();
  if (!needle) return true;
  const haystack = String(project[condition.field]).toLowerCase();
  if (condition.operator === 'is') return haystack === needle;
  if (condition.operator === 'is-not') return haystack !== needle;
  return haystack.includes(needle);
}

interface MetricButtonProps {
  readonly label: string;
  readonly count: number;
  readonly active: boolean;
  readonly onClick: () => void;
}

function MetricButton({ label, count, active, onClick }: MetricButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label}: ${count}`}
      className="block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className={cn('transition-colors hover:bg-accent/40', active && 'bg-primary/5 ring-2 ring-primary')}>
        <CardContent className="flex items-center justify-between gap-2 px-4 py-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-lg font-semibold text-foreground">{count}</span>
        </CardContent>
      </Card>
    </button>
  );
}

interface PendingDelete {
  readonly ids: readonly string[];
  readonly label: string;
}

export function ListPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({ status: true, owner: true, updated: true });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const nextConditionId = useRef(1);

  const statusCounts = projects.reduce<Record<ProjectStatus, number>>(
    (acc, project) => {
      acc[project.status] += 1;
      return acc;
    },
    { active: 0, draft: 0, archived: 0 },
  );

  const activeMetricKey: ProjectStatus | 'all' = statusFilter.length === 1 ? statusFilter[0] : 'all';

  function handleMetricClick(key: ProjectStatus | 'all') {
    if (key === 'all' || (statusFilter.length === 1 && statusFilter[0] === key)) {
      setStatusFilter([]);
    } else {
      setStatusFilter([key]);
    }
  }

  const filteredProjects = projects.filter((project) => {
    if (statusFilter.length && !statusFilter.includes(project.status)) return false;
    if (ownerFilter.length && !ownerFilter.includes(project.owner)) return false;
    if (search.trim() && !project.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return conditions.every((condition) => matchesCondition(project, condition));
  });

  const hasActiveFilters = search.trim() !== '' || statusFilter.length > 0 || ownerFilter.length > 0 || conditions.length > 0;

  function handleResetFilters() {
    setSearch('');
    setStatusFilter([]);
    setOwnerFilter([]);
    setConditions([]);
  }

  function handleAddCondition() {
    const id = `cond-${nextConditionId.current++}`;
    setConditions((current) => [...current, { id, field: 'name', operator: 'contains', value: '' }]);
  }

  function handleConditionFieldChange(id: string, field: ConditionField) {
    setConditions((current) =>
      current.map((condition) =>
        condition.id === id
          ? { id, field, operator: defaultOperatorForField(field), value: defaultValueForField(field) }
          : condition,
      ),
    );
  }

  function handleConditionOperatorChange(id: string, operator: ConditionOperator) {
    setConditions((current) => current.map((condition) => (condition.id === id ? { ...condition, operator } : condition)));
  }

  function handleConditionValueChange(id: string, value: string) {
    setConditions((current) => current.map((condition) => (condition.id === id ? { ...condition, value } : condition)));
  }

  function handleRemoveCondition(id: string) {
    setConditions((current) => current.filter((condition) => condition.id !== id));
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleIds = filteredProjects.map((project) => project.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const headerChecked: boolean | 'indeterminate' =
    selectedVisibleCount === 0 ? false : selectedVisibleCount === visibleIds.length ? true : 'indeterminate';

  function handleToggleAll() {
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
    setSelectedIds((current) => {
      const next = new Set(current);
      visibleIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  function setProjectStatus(id: string, status: ProjectStatus) {
    setProjects((current) => current.map((project) => (project.id === id ? { ...project, status } : project)));
  }

  function handleBulkArchive() {
    setProjects((current) =>
      current.map((project) => (selectedIds.has(project.id) ? { ...project, status: 'archived' } : project)),
    );
    setSelectedIds(new Set());
  }

  function requestDelete(ids: readonly string[], label: string) {
    setPendingDelete({ ids, label });
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    const idsToRemove = new Set(pendingDelete.ids);
    setProjects((current) => current.filter((project) => !idsToRemove.has(project.id)));
    setSelectedIds((current) => {
      const next = new Set(current);
      idsToRemove.forEach((id) => next.delete(id));
      return next;
    });
    setPendingDelete(null);
  }

  function moveProject(id: string, direction: -1 | 1) {
    setProjects((current) => {
      const index = current.findIndex((project) => project.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  function handleDrop(targetId: string) {
    if (draggedId && draggedId !== targetId) {
      setProjects((current) => {
        const sourceIndex = current.findIndex((project) => project.id === draggedId);
        const targetIndex = current.findIndex((project) => project.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return current;
        const next = [...current];
        const [moved] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
    }
    setDraggedId(null);
    setDragOverId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Browse, filter, and manage every project across your workspace."
        actions={
          <ActionGroup
            primary={
              <Button>
                <PlusIcon aria-hidden="true" />
                New project
              </Button>
            }
          />
        }
      />

      <HelpCallout icon={CircleHelpIcon} title="Working with this table">
        The metrics below are shortcuts — click one to filter by status. Combine the Status and Owner filters for
        common views, or use More filters to build a multi-condition query. Drag the handle to reorder rows, or use
        Move up / Move down in the ⋮ menu.
      </HelpCallout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricButton
          label="All projects"
          count={projects.length}
          active={activeMetricKey === 'all'}
          onClick={() => handleMetricClick('all')}
        />
        <MetricButton
          label="Active"
          count={statusCounts.active}
          active={activeMetricKey === 'active'}
          onClick={() => handleMetricClick('active')}
        />
        <MetricButton
          label="Draft"
          count={statusCounts.draft}
          active={activeMetricKey === 'draft'}
          onClick={() => handleMetricClick('draft')}
        />
        <MetricButton
          label="Archived"
          count={statusCounts.archived}
          active={activeMetricKey === 'archived'}
          onClick={() => handleMetricClick('archived')}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <SearchIcon
                aria-hidden="true"
                className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search projects…"
                className="h-8 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <FacetedFilter title="Status" options={STATUS_OPTIONS} selected={statusFilter} onChange={setStatusFilter} />
            <FacetedFilter title="Owner" options={OWNER_OPTIONS} selected={ownerFilter} onChange={setOwnerFilter} />

            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon aria-hidden="true" className="size-3.5" />
                  More filters
                  {conditions.length > 0 ? (
                    <Badge variant="secondary" className="ml-1">
                      {conditions.length}
                    </Badge>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[28rem]" align="start">
                <PopoverHeader>
                  <PopoverTitle>Advanced filters</PopoverTitle>
                  <PopoverDescription>Combine conditions to narrow the list further. All conditions must match.</PopoverDescription>
                </PopoverHeader>
                <div className="flex flex-col gap-2 pt-3">
                  {conditions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No conditions yet — add one below.</p>
                  ) : (
                    conditions.map((condition) => (
                      <div key={condition.id} className="flex items-center gap-2">
                        <Select
                          value={condition.field}
                          onValueChange={(value) => handleConditionFieldChange(condition.id, value as ConditionField)}
                        >
                          <SelectTrigger className="w-28" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_OPTIONS.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(value) => handleConditionOperatorChange(condition.id, value as ConditionOperator)}
                        >
                          <SelectTrigger className="w-28" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS_BY_FIELD[condition.field].map((operator) => (
                              <SelectItem key={operator.value} value={operator.value}>
                                {operator.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {condition.field === 'status' ? (
                          <Select value={condition.value} onValueChange={(value) => handleConditionValueChange(condition.id, value)}>
                            <SelectTrigger className="flex-1" size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : condition.field === 'owner' ? (
                          <Select value={condition.value} onValueChange={(value) => handleConditionValueChange(condition.id, value)}>
                            <SelectTrigger className="flex-1" size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OWNER_OPTIONS.map((owner) => (
                                <SelectItem key={owner.value} value={owner.value}>
                                  {owner.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={condition.value}
                            onChange={(e) => handleConditionValueChange(condition.id, e.target.value)}
                            placeholder="Value"
                            className="h-8 flex-1"
                          />
                        )}

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Remove condition"
                          onClick={() => handleRemoveCondition(condition.id)}
                        >
                          <XIcon aria-hidden="true" className="size-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button variant="outline" size="sm" className="self-start" onClick={handleAddCondition}>
                    <PlusIcon aria-hidden="true" className="size-3.5" />
                    Add condition
                  </Button>
                </div>
                {conditions.length > 0 ? (
                  <>
                    <Separator className="my-3" />
                    <Button variant="ghost" size="sm" onClick={() => setConditions([])}>
                      Clear all conditions
                    </Button>
                  </>
                ) : null}
              </PopoverContent>
            </Popover>

            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontalIcon aria-hidden="true" className="size-3.5" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.status}
                    onCheckedChange={(checked) => setVisibleColumns((current) => ({ ...current, status: checked }))}
                  >
                    Status
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.owner}
                    onCheckedChange={(checked) => setVisibleColumns((current) => ({ ...current, owner: checked }))}
                  >
                    Owner
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.updated}
                    onCheckedChange={(checked) => setVisibleColumns((current) => ({ ...current, updated: checked }))}
                  >
                    Updated
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredProjects.length}</span> of {projects.length}{' '}
              projects
              {hasActiveFilters ? ' · filters applied' : ''}
            </p>
            {hasActiveFilters ? (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <FunnelXIcon aria-hidden="true" className="size-3.5" />
                Reset filters
              </Button>
            ) : null}
          </div>

          {selectedIds.size > 0 ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-accent/50 px-4 py-2.5 ring-1 ring-primary/20">
              <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                  <ArchiveIcon aria-hidden="true" className="size-3.5" />
                  Archive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => requestDelete([...selectedIds], `${selectedIds.size} projects`)}
                >
                  <Trash2Icon aria-hidden="true" className="size-3.5" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          ) : null}

          {filteredProjects.length === 0 ? (
            <DataTableEmptyState
              variant="no-results"
              icon={<SearchIcon />}
              title="No projects match your filters"
              description="Try adjusting your search, filters, or advanced conditions."
              action={
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <span className="sr-only">Reorder</span>
                  </TableHead>
                  <TableHead className="w-10">
                    <Checkbox checked={headerChecked} onCheckedChange={handleToggleAll} aria-label="Select all projects" />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {visibleColumns.status ? <TableHead>Status</TableHead> : null}
                  {visibleColumns.owner ? <TableHead>Owner</TableHead> : null}
                  {visibleColumns.updated ? <TableHead>Updated</TableHead> : null}
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    onDragOver={(e) => {
                      if (draggedId && draggedId !== project.id) {
                        e.preventDefault();
                        setDragOverId(project.id);
                      }
                    }}
                    onDragLeave={() => setDragOverId((current) => (current === project.id ? null : current))}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(project.id);
                    }}
                    className={cn(
                      draggedId === project.id && 'opacity-50',
                      dragOverId === project.id &&
                        draggedId !== project.id &&
                        'outline outline-2 -outline-offset-2 outline-primary',
                    )}
                  >
                    <TableCell>
                      <span
                        draggable
                        aria-hidden="true"
                        onDragStart={(e) => {
                          setDraggedId(project.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          setDraggedId(null);
                          setDragOverId(null);
                        }}
                        className="inline-flex cursor-grab items-center text-muted-foreground active:cursor-grabbing"
                      >
                        <GripVerticalIcon className="size-4" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(project.id)}
                        onCheckedChange={() => toggleSelected(project.id)}
                        aria-label={`Select ${project.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{project.name}</TableCell>
                    {visibleColumns.status ? (
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
                      </TableCell>
                    ) : null}
                    {visibleColumns.owner ? <TableCell className="text-muted-foreground">{project.owner}</TableCell> : null}
                    {visibleColumns.updated ? (
                      <TableCell className="text-muted-foreground">{project.updated}</TableCell>
                    ) : null}
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${project.name}`}>
                              <MoreVerticalIcon aria-hidden="true" className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <PencilIcon aria-hidden="true" className="size-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => moveProject(project.id, -1)}>
                              <ChevronUpIcon aria-hidden="true" className="size-3.5" />
                              Move up
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => moveProject(project.id, 1)}>
                              <ChevronDownIcon aria-hidden="true" className="size-3.5" />
                              Move down
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {project.status === 'archived' ? (
                              <DropdownMenuItem onSelect={() => setProjectStatus(project.id, 'active')}>
                                <RefreshCwIcon aria-hidden="true" className="size-3.5" />
                                Restore
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => setProjectStatus(project.id, 'archived')}>
                                <ArchiveIcon aria-hidden="true" className="size-3.5" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => requestDelete([project.id], project.name)}
                            >
                              <Trash2Icon aria-hidden="true" className="size-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete && pendingDelete.ids.length > 1 ? 'projects' : 'project'}?</DialogTitle>
            <DialogDescription>
              {pendingDelete ? `This will permanently remove ${pendingDelete.label}. This can't be undone.` : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2Icon aria-hidden="true" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
