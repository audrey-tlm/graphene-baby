/**
 * Guardrail 7 — reuse existing Graphene/project patterns instead of one-off
 * compositions. Pure data documenting the canonical implementation of each
 * established pattern in this codebase.
 *
 * Scope, agreed before implementing: this registry (plus `PatternException`,
 * see src/components/PatternException.tsx) enforces that a *declared*
 * deviation carries a documented reason. It does not — cannot, deterministically —
 * detect an *undeclared* one-off; recognizing "this hand-written JSX is shaped
 * like a page header" is exactly the structural/visual judgment call these
 * guardrails are built to avoid asking for.
 */
export const PATTERN_REGISTRY = {
  pageHeader: { component: 'PageHeader', description: 'Page title, description, and up to 2 header actions.' },
  emptyState: {
    component: 'Empty / DataTableEmptyState',
    description: 'An empty list/table/section state with an explanation and a next step.',
  },
  confirmationDialog: {
    component: 'Dialog (delete-confirm pattern)',
    description: 'Confirms a destructive action before it takes effect.',
  },
  helpContent: {
    component: 'HelpCallout',
    description: "Dismissible educational content, toggleable via the app's global Helpful Content control.",
  },
  sidePanel: { component: 'Sheet', description: "Configure or edit something without leaving the current page." },
} satisfies Readonly<Record<string, { readonly component: string; readonly description: string }>>;

export type RegisteredPattern = keyof typeof PATTERN_REGISTRY;
