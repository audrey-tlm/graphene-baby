/**
 * Guardrails 4b & 6 — components have a declared intended purpose; usage is
 * checked against it rather than judged by whether the choice "looks right".
 *
 * Pure data. Only components this app actually imports are listed — no
 * `Link` entry, because Graphene has no Link component (link-styled actions
 * are `<Button variant="link">`); inventing one here would document an API
 * that doesn't exist. Adding a component is a one-line edit — no rule changes.
 */
export const COMPONENT_REGISTRY = {
  Button: { intendedFor: ['action'] },
  Badge: { intendedFor: ['status', 'classification'] },
  Card: { intendedFor: ['grouping'] },
  Checkbox: { intendedFor: ['selection'] },
  Input: { intendedFor: ['data-entry'] },
  Select: { intendedFor: ['data-entry'] },
  Tabs: { intendedFor: ['view-switching'] },
} satisfies Readonly<Record<string, { readonly intendedFor: readonly string[] }>>;

export type RegisteredComponent = keyof typeof COMPONENT_REGISTRY;

export function isIntendedUsage(component: RegisteredComponent, intent: string): boolean {
  return (COMPONENT_REGISTRY[component].intendedFor as readonly string[]).includes(intent);
}
