import {
  Button,
  Card,
  CardContent,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  Input,
  PageFocused,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from '@gravitee/graphene-core';
import { ArrowLeftIcon, ArrowRightIcon, CircleHelpIcon, RocketIcon } from '@gravitee/graphene-core/icons';
import { useId, useState } from 'react';

import { HelpCallout } from '../components/help';
import { PageHeader } from '../components/PageHeader';

const STEPS = ['Details', 'Configure', 'Review'] as const;

const TYPE_LABELS: Record<string, string> = {
  rest: 'REST API',
  graphql: 'GraphQL',
  database: 'Database',
};

interface WizardData {
  name: string;
  description: string;
  type: string;
  endpoint: string;
}

const INITIAL_DATA: WizardData = { name: '', description: '', type: 'rest', endpoint: '' };

export function AddItemWizardPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const nameId = useId();
  const descriptionId = useId();
  const endpointId = useId();
  const isLastStep = step === STEPS.length - 1;

  function handleNext() {
    if (isLastStep) {
      // Replace with your create mutation
      return;
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add data source" description="Connect a new data source in three steps." />

      <PageFocused>
        <div className="flex flex-col gap-6">
          <HelpCallout icon={CircleHelpIcon} title="You can change your mind">
            Nothing is created until you confirm on the last step. Use Back at any point to revisit an earlier step —
            what you've already entered stays filled in.
          </HelpCallout>

          <nav aria-label="Progress" className="flex items-center justify-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                      i <= step ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-sm ${i <= step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 ? <div className="h-px w-8 bg-border" /> : null}
              </div>
            ))}
          </nav>

          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              {step === 0 && (
                <>
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor={nameId}>Name</FieldLabel>
                      <FieldDescription>How this data source appears in the dashboard.</FieldDescription>
                    </FieldContent>
                    <Input
                      id={nameId}
                      placeholder="e.g. Production database"
                      value={data.name}
                      onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                    />
                  </Field>
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
                      <FieldDescription>Optional context for teammates.</FieldDescription>
                    </FieldContent>
                    <Textarea
                      id={descriptionId}
                      placeholder="Optional description"
                      value={data.description}
                      onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
                    />
                  </Field>
                </>
              )}
              {step === 1 && (
                <>
                  <Field>
                    <FieldContent>
                      <FieldLabel>Connection type</FieldLabel>
                      <FieldDescription>How Gamma should communicate with this source.</FieldDescription>
                    </FieldContent>
                    <Select value={data.type} onValueChange={(value) => setData((d) => ({ ...d, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rest">REST API</SelectItem>
                        <SelectItem value="graphql">GraphQL</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor={endpointId}>Endpoint</FieldLabel>
                      <FieldDescription>Base URL or connection string.</FieldDescription>
                    </FieldContent>
                    <Input
                      id={endpointId}
                      placeholder="https://"
                      value={data.endpoint}
                      onChange={(e) => setData((d) => ({ ...d, endpoint: e.target.value }))}
                    />
                  </Field>
                </>
              )}
              {step === 2 && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-foreground">Review your configuration</p>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">Name</dt>
                      <dd className="text-sm text-foreground">{data.name || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Connection type</dt>
                      <dd className="text-sm text-foreground">{TYPE_LABELS[data.type]}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Endpoint</dt>
                      <dd className="text-sm text-foreground">{data.endpoint || '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">Description</dt>
                      <dd className="text-sm text-foreground">{data.description || '—'}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 0}>
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  <RocketIcon aria-hidden="true" className="size-4" />
                  Create data source
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </PageFocused>
    </div>
  );
}
