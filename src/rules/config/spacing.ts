/**
 * Guardrail 3 — Spacing follows declared relationships.
 *
 * Pure data: the allowed Graphene `gap-*` scale for each declared relationship.
 * Calibrated against the gap values already in use across the example pages
 * (grep `gap-` across src/), so adopting `<Stack>` on existing markup should
 * rarely require picking a new value. Adding an approved token is a one-line
 * edit here — no component or rule code changes.
 */
export type SpacingRelationship = 'related' | 'group' | 'section' | 'separated';

export const SPACING_TOKENS: Readonly<Record<SpacingRelationship, readonly string[]>> = {
  // Tightly coupled inline content — a label and its value, an icon and its text.
  related: ['gap-0', 'gap-0.5', 'gap-1', 'gap-1.5'],
  // A cluster of distinct but related items — fields in a form, rows in a list.
  group: ['gap-2', 'gap-3', 'gap-4'],
  // Space between a page's major sections (header, help callout, content blocks).
  section: ['gap-6', 'gap-8'],
  // Deliberately distanced from the rest — e.g. a danger zone set apart from the main content.
  separated: ['gap-12', 'gap-16'],
};

export function isApprovedSpacingToken(relationship: SpacingRelationship, gapClassName: string): boolean {
  return SPACING_TOKENS[relationship].includes(gapClassName);
}
