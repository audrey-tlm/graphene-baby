/** The token whose category is "Primary (Brand)" — Graphene's brand color, not a status signal. */
export const BRAND_TOKEN_ID = 'primary';

/** Token ids that each carry one dedicated semantic status meaning — success, warning, destructive, highlight. */
export const SEMANTIC_STATUS_TOKEN_IDS = ['destructive', 'success', 'warning', 'highlight'] as const;

export type SemanticStatusTokenId = (typeof SEMANTIC_STATUS_TOKEN_IDS)[number];

export function isSemanticStatusTokenId(id: string): id is SemanticStatusTokenId {
  return (SEMANTIC_STATUS_TOKEN_IDS as readonly string[]).includes(id);
}

/**
 * Explicit, reviewable exceptions: a semantic status token intentionally mapped
 * to reuse the brand color instead of its own. Empty by default — add an entry
 * (with why, in a comment) to accept a brand/semantic collision instead of it
 * being flagged as hierarchy.semantic-status-not-brand-color.
 */
export const SEMANTIC_BRAND_MAPPING_EXCEPTIONS: ReadonlySet<SemanticStatusTokenId> = new Set([]);
