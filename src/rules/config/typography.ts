/**
 * Guardrail 1 — Declared content hierarchy.
 *
 * Pure data: the allowed mapping from a `contentRole` to approved Graphene
 * typography treatments, plus a numeric `strength` used to check that a
 * lower role never outweighs a higher one within the same `<Section>`.
 * Adding a new approved treatment is a one-line edit here — no component
 * or rule code changes.
 *
 * Values are exactly what's already used across the example pages (PageHeader's
 * h1, SectionHeader's h2, field labels/values, timestamps, …), so adopting
 * `<ContentText>` on existing markup should never require a new className.
 */
export type ContentRole = 'primary' | 'secondary' | 'metadata';

export interface ContentRoleTreatment {
  readonly className: string;
  /** Higher = visually stronger. Compared across roles within one Section, not just within one role. */
  readonly strength: number;
}

export const CONTENT_ROLE_TREATMENTS: Readonly<Record<ContentRole, readonly ContentRoleTreatment[]>> = {
  primary: [
    { className: 'text-2xl font-semibold text-foreground', strength: 4 },
    { className: 'text-xl font-semibold text-foreground', strength: 4 },
    { className: 'text-lg font-medium text-foreground', strength: 3 },
    { className: 'text-sm font-medium text-foreground', strength: 2 },
  ],
  secondary: [
    { className: 'text-sm text-foreground', strength: 2 },
    { className: 'text-sm text-muted-foreground', strength: 1 },
  ],
  metadata: [{ className: 'text-xs text-muted-foreground', strength: 0 }],
};

export function isApprovedContentRoleTreatment(role: ContentRole, className: string): boolean {
  return CONTENT_ROLE_TREATMENTS[role].some((t) => t.className === className);
}

export function contentRoleStrength(role: ContentRole, className: string): number {
  const treatment = CONTENT_ROLE_TREATMENTS[role].find((t) => t.className === className);
  // Falls back to the role's own weakest approved strength if className isn't approved —
  // the "approved treatment" rule reports that separately; this just keeps ordering sane.
  return treatment?.strength ?? Math.min(...CONTENT_ROLE_TREATMENTS[role].map((t) => t.strength));
}
