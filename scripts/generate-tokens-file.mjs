#!/usr/bin/env node
/**
 * Exports the app's design tokens (src/theme/tokenSchema.generated.ts) as a
 * standalone tokens.css file, for sharing with the team or other tools —
 * separate from the "Export as CSS" panel in Theme settings, which only
 * exports the current session's draft *overrides*, not the full token set.
 * Re-run after `npm run generate:tokens` picks up new/renamed tokens:
 *
 *   npm run generate:tokens-file
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const schemaPath = path.join(rootDir, 'src/theme/tokenSchema.generated.ts');
const outPath = path.join(rootDir, 'tokens.css');

const source = readFileSync(schemaPath, 'utf8');
const match = /export const THEME_TOKENS: readonly ThemeToken\[\] = (\[[\s\S]*?\n\]);/.exec(source);
if (!match) {
  throw new Error(`Could not find THEME_TOKENS in ${schemaPath}`);
}

/** @type {{name: string, category: string, defaultLight: string, defaultDark: string}[]} */
const tokens = JSON.parse(match[1]);

const byCategory = new Map();
for (const token of tokens) {
  const list = byCategory.get(token.category) ?? [];
  list.push(token);
  byCategory.set(token.category, list);
}

function renderBlock(selector, pick) {
  const lines = [`${selector} {`];
  for (const [category, categoryTokens] of byCategory) {
    lines.push(`  /* ${category} */`);
    for (const token of categoryTokens) {
      lines.push(`  --${token.name}: ${pick(token)};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

const output = `/* GENERATED FILE — do not edit by hand.
 * Produced by scripts/generate-tokens-file.mjs from
 * src/theme/tokenSchema.generated.ts. Re-run \`npm run generate:tokens-file\`
 * after the token schema changes.
 *
 * Graphene's own light/dark values — this is the design system's defaults,
 * not any per-user overrides saved in the Theme settings panel.
 */

${renderBlock(':root', (t) => t.defaultLight)}

${renderBlock('.dark', (t) => t.defaultDark)}
`;

writeFileSync(outPath, output);
console.log(`Wrote ${tokens.length} tokens to ${path.relative(rootDir, outPath)}`);
