# Gamma Theming Playground

A [Graphene](https://www.npmjs.com/package/@gravitee/graphene-core)-based example app with two things bolted on top of a normal design-system demo:

1. **A live theme editor** — override any color token independently for light and dark mode, with a built-in WCAG AA contrast checker, then save or discard the changes.
2. **A deterministic UX hierarchy guardrail system** — instead of asking an LLM to judge whether a page's visual hierarchy "looks right," pages *declare* their intent in code (content roles, spacing relationships, focal points, component usage) and a rules engine checks the declarations deterministically. Nothing here is a subjective visual judgment call.

The example pages (Dashboard, a projects list, a detail page, a policy-flow builder, a settings form, empty/delete/wizard states, …) exist to exercise both systems against realistic, non-trivial UI.

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite (Vitest) |
| `npm run lint` | Run oxlint |
| `npm run typecheck` | `tsc -b`, no emit |
| `npm run generate:tokens` | Re-derive `src/theme/tokenSchema.generated.ts` from the installed `@gravitee/graphene-core` package — run after bumping that dependency |
| `npm run generate:tokens-file` | Export the full design token set (light + dark, all 37 tokens) as a standalone [`tokens.css`](./tokens.css) file, for sharing with design tools or other repos |

## Theme settings

Click **Theme settings** in the header to open the panel. Colors are edited **per resolved mode** — a **Light / Dark** toggle inside the panel controls which mode you're currently editing (it drives the app's real theme, so changes preview live across every example page). An override made in light mode never bleeds into dark, and vice versa.

- Each token pair shows its live WCAG contrast ratio; saving is blocked while any pair fails AA.
- **Reset all** clears only the currently-viewed mode's overrides.
- **Reset to Graphene defaults** clears *everything* — both modes, draft and saved — back to the design system's shipped colors.
- **Export as CSS** shows the current draft as `:root { }` / `.dark { }` blocks.

This is different from `tokens.css` (see above): the panel's export is *your local draft overrides*; `tokens.css` is the full, generated set of Graphene's actual default values.

## The guardrail system

The core idea: **Claude enforces declared rules, it doesn't decide what "good" looks like.** Each guardrail pairs an explicit *declaration* (a component/prop the page author writes) with a *deterministic check* against that declaration — never a heuristic about how something looks.

| # | Guardrail | Declared via |
| --- | --- | --- |
| 1 | Content hierarchy (primary/secondary/metadata) uses an approved typographic treatment, and a lower role can't out-emphasize a higher one | `<ContentText contentRole="...">` |
| 2 | Every declared section has exactly one focal point | `<Section focalPoint="...">` / `<FocalPoint name="...">` |
| 3 | Spacing follows a declared relationship, using an approved Graphene spacing token | `<Stack relationship="..." gap="...">` |
| 4 | Actions have correct emphasis: primary stands out from secondary, destructive actions never take the primary slot, header actions stay to 2 visible + overflow | `<ActionGroup primary=... secondary=... overflow=...>` |
| 5 | Status is never communicated by color alone, and only uses Graphene's semantic Badge tokens | `<Status status="..." label=... icon=...>` |
| 6 | A component's usage matches its registered intended purpose | `<DeclaredIntent component="..." intent="...">` against `componentRegistry.ts` |
| 7 | Deviating from an established UI pattern requires a documented reason | `<PatternException pattern="..." reason="...">` against `patternRegistry.ts` |
| 8 | A semantic status token (success/warning/destructive/highlight) resolves to its own dedicated color, not the brand color — checked against the *resolved* theme, not just the declared name | theme-level, evaluated from live contrast results |

Structurally, this is split into three layers:

- **Intent** — the declaration components above (`src/components/*`), which render nothing extra and just register a fact.
- **Rules** — pure-data config (`src/rules/config/*.ts`): approved typography treatments, spacing tokens, the component/pattern registries.
- **Enforcement** — `src/rules/registry.ts`, pure `evaluate(facts) => RuleResult[]` functions with no JSX, checked against whatever the currently-mounted page actually declared (`src/rules/runtimeFacts.tsx`).

Open **Theme settings → Hierarchy guardrails** on any example page to see every rule's live pass/warning/violation/exempted result.

## Example pages

Dashboard · Projects (list) · Project (detail) · Policy Studio · Settings (form) · Integrations (empty state) · Webhooks (delete modal) · Connectors (side panel) · Data source (wizard)

Each one exists to exercise a different Graphene UI pattern while dogfooding the guardrail components above — they're the guardrail system's own test surface, not just a components showcase.
