#!/usr/bin/env node
/**
 * Derives the app's theme token schema directly from the installed
 * @gravitee/graphene-core package's shipped token CSS, instead of hand-typing
 * token names. Re-run after bumping the graphene-core dependency:
 *
 *   npm run generate:tokens
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
// package.json isn't a defined export subpath, so resolve the public "." entry
// (…/dist/index.js) and walk up to the package root instead.
const pkgDir = path.dirname(path.dirname(require.resolve('@gravitee/graphene-core')));

const primitiveCss = readFileSync(path.join(pkgDir, 'dist/tokens/primitive.css'), 'utf8');
const semanticCss = readFileSync(path.join(pkgDir, 'dist/tokens/semantic.css'), 'utf8');
const componentCss = readFileSync(path.join(pkgDir, 'dist/tokens/component.css'), 'utf8');

/** @param {string} css @returns {Record<string, string>} */
function parseDeclarations(css, selector) {
  const blockMatch = new RegExp(`${selector}\\s*{([^}]*)}`, 's').exec(css);
  if (!blockMatch) return {};
  const decls = {};
  for (const m of blockMatch[1].matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
    decls[m[1]] = m[2].trim();
  }
  return decls;
}

const primitiveRoot = parseDeclarations(primitiveCss, ':root');

/** Resolves whether a token's value is a color, by following var() references
 * into the primitive layer rather than guessing from the token's name. */
function resolvesToColor(value, depth = 0) {
  if (depth > 5) return false;
  const v = value.trim();
  if (/^(oklch|color-mix|rgb|rgba|hsl|hsla)\(/.test(v) || v.startsWith('#')) return true;
  const varMatch = /^var\(--([a-zA-Z0-9-]+)\)$/.exec(v);
  if (varMatch) {
    const referenced = primitiveRoot[varMatch[1]];
    if (referenced) return resolvesToColor(referenced, depth + 1);
  }
  return false;
}

// Category labels, one per Graphene's own section comments in semantic.css /
// component.css — used only to group controls in the settings UI.
const CATEGORY_BY_TOKEN = {
  background: 'Surface',
  foreground: 'Surface',
  card: 'Card',
  'card-foreground': 'Card',
  popover: 'Popover',
  'popover-foreground': 'Popover',
  primary: 'Primary (Brand)',
  'primary-foreground': 'Primary (Brand)',
  secondary: 'Secondary',
  'secondary-foreground': 'Secondary',
  muted: 'Muted',
  'muted-foreground': 'Muted',
  accent: 'Accent',
  'accent-foreground': 'Accent',
  destructive: 'Destructive',
  'destructive-foreground': 'Destructive',
  success: 'Success',
  'success-foreground': 'Success',
  warning: 'Warning',
  'warning-foreground': 'Warning',
  highlight: 'Highlight',
  'highlight-foreground': 'Highlight',
  'sidebar-background': 'Sidebar',
  'sidebar-foreground': 'Sidebar',
  'sidebar-accent': 'Sidebar',
  'sidebar-accent-foreground': 'Sidebar',
  'sidebar-primary': 'Sidebar',
  'sidebar-primary-foreground': 'Sidebar',
};

// Tokens the settings UI surfaces as editable controls in the MVP: the core
// semantic surface/brand/status pairs. Everything else Graphene defines is
// still extracted into the schema below (so it exists for later use) but is
// left out of CORE_TOKEN_NAMES until a control for it is wanted.
const CORE_TOKEN_NAMES = new Set([
  'background',
  'foreground',
  'card',
  'card-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'highlight',
  'highlight-foreground',
]);

function buildTokens(css, tier) {
  const light = parseDeclarations(css, ':root');
  const dark = parseDeclarations(css, '\\.dark');
  return Object.keys(light)
    .filter((name) => resolvesToColor(light[name]))
    .map((name) => ({
      name,
      tier,
      category: CATEGORY_BY_TOKEN[name] ?? 'Other',
      isCore: CORE_TOKEN_NAMES.has(name),
      defaultLight: light[name],
      defaultDark: dark[name] ?? light[name],
    }));
}

const tokens = [...buildTokens(semanticCss, 'semantic'), ...buildTokens(componentCss, 'component')];

const tokenNames = new Set(tokens.map((t) => t.name));
const pairs = tokens
  .filter((t) => !t.name.endsWith('-foreground') && tokenNames.has(`${t.name}-foreground`))
  .map((t) => ({
    id: t.name,
    label: t.category,
    background: t.name,
    foreground: `${t.name}-foreground`,
    isCore: t.isCore,
  }));

const header = `// GENERATED FILE — do not edit by hand.
// Produced by scripts/generate-token-schema.mjs from the installed
// @gravitee/graphene-core package. Re-run \`npm run generate:tokens\` after
// bumping the graphene-core dependency to pick up new/renamed tokens.

export interface ThemeToken {
  /** CSS custom property name, without the leading '--'. */
  readonly name: string;
  readonly tier: 'semantic' | 'component';
  readonly category: string;
  /** Whether this token is surfaced as an editable control in the MVP settings panel. */
  readonly isCore: boolean;
  readonly defaultLight: string;
  readonly defaultDark: string;
}

export interface ContrastPair {
  readonly id: string;
  readonly label: string;
  readonly background: string;
  readonly foreground: string;
  readonly isCore: boolean;
}
`;

const body = `
export const THEME_TOKENS: readonly ThemeToken[] = ${JSON.stringify(tokens, null, 2)};

export const CONTRAST_PAIRS: readonly ContrastPair[] = ${JSON.stringify(pairs, null, 2)};
`;

const outPath = path.join(import.meta.dirname, '../src/theme/tokenSchema.generated.ts');
writeFileSync(outPath, header + body);
console.log(`Wrote ${tokens.length} tokens (${tokens.filter((t) => t.isCore).length} core) and ${pairs.length} contrast pairs to ${path.relative(process.cwd(), outPath)}`);
