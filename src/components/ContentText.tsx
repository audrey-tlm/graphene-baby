import type { ElementType, ReactNode } from 'react';

import type { ContentRole } from '../rules/config/typography';
import { useRegisterGuardrailFact, useSectionKey } from '../rules/runtimeFacts';

interface ContentTextProps {
  /**
   * Declared hierarchy role — checked against CONTENT_ROLE_TREATMENTS, not judged
   * visually. Named `contentRole`, not `role`: a plain `role` prop reads to
   * static analysis (and to anyone skimming the JSX) as an ARIA role — jsx-a11y's
   * `aria-role` rule flagged exactly that when this was still called `role`.
   */
  readonly contentRole: ContentRole;
  readonly as?: ElementType;
  /** Must be one of the approved treatments for `contentRole` (see src/rules/config/typography.ts) — hierarchy.content-role-approved-treatment flags anything else. */
  readonly className: string;
  readonly children: ReactNode;
}

/**
 * Declares a piece of content's hierarchy role (Guardrail 1) instead of leaving it
 * to be judged from its rendered appearance. Scoped to the nearest enclosing
 * `<Section>` (or the page-wide default bucket, if none) for the
 * hierarchy.content-role-strength-order check.
 */
export function ContentText({ contentRole, as: Tag = 'p', className, children }: ContentTextProps) {
  const sectionKey = useSectionKey();
  useRegisterGuardrailFact({ kind: 'content-role', role: contentRole, className, sectionKey });

  return <Tag className={className}>{children}</Tag>;
}
