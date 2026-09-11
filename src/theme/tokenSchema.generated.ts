// GENERATED FILE — do not edit by hand.
// Produced by scripts/generate-token-schema.mjs from the installed
// @gravitee/graphene-core package. Re-run `npm run generate:tokens` after
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

export const THEME_TOKENS: readonly ThemeToken[] = [
  {
    "name": "background",
    "tier": "semantic",
    "category": "Surface",
    "isCore": true,
    "defaultLight": "var(--graphene-white)",
    "defaultDark": "var(--graphene-stone-975)"
  },
  {
    "name": "foreground",
    "tier": "semantic",
    "category": "Surface",
    "isCore": true,
    "defaultLight": "var(--graphene-stone-900)",
    "defaultDark": "var(--graphene-stone-50)"
  },
  {
    "name": "card",
    "tier": "semantic",
    "category": "Card",
    "isCore": true,
    "defaultLight": "var(--graphene-white)",
    "defaultDark": "var(--graphene-stone-900)"
  },
  {
    "name": "card-foreground",
    "tier": "semantic",
    "category": "Card",
    "isCore": true,
    "defaultLight": "var(--graphene-stone-900)",
    "defaultDark": "var(--graphene-stone-50)"
  },
  {
    "name": "popover",
    "tier": "semantic",
    "category": "Popover",
    "isCore": false,
    "defaultLight": "var(--graphene-white)",
    "defaultDark": "var(--graphene-stone-750)"
  },
  {
    "name": "popover-foreground",
    "tier": "semantic",
    "category": "Popover",
    "isCore": false,
    "defaultLight": "var(--graphene-stone-900)",
    "defaultDark": "var(--graphene-stone-50)"
  },
  {
    "name": "primary",
    "tier": "semantic",
    "category": "Primary (Brand)",
    "isCore": true,
    "defaultLight": "var(--graphene-solaris-600)",
    "defaultDark": "var(--graphene-solaris-400)"
  },
  {
    "name": "primary-foreground",
    "tier": "semantic",
    "category": "Primary (Brand)",
    "isCore": true,
    "defaultLight": "var(--graphene-white)",
    "defaultDark": "var(--graphene-stone-950)"
  },
  {
    "name": "secondary",
    "tier": "semantic",
    "category": "Secondary",
    "isCore": true,
    "defaultLight": "var(--graphene-stone-100)",
    "defaultDark": "var(--graphene-stone-800)"
  },
  {
    "name": "secondary-foreground",
    "tier": "semantic",
    "category": "Secondary",
    "isCore": true,
    "defaultLight": "var(--graphene-stone-800)",
    "defaultDark": "var(--graphene-stone-50)"
  },
  {
    "name": "muted",
    "tier": "semantic",
    "category": "Muted",
    "isCore": true,
    "defaultLight": "var(--graphene-stone-100)",
    "defaultDark": "var(--graphene-stone-800)"
  },
  {
    "name": "muted-foreground",
    "tier": "semantic",
    "category": "Muted",
    "isCore": true,
    "defaultLight": "var(--graphene-stone-500)",
    "defaultDark": "var(--graphene-stone-400)"
  },
  {
    "name": "accent",
    "tier": "semantic",
    "category": "Accent",
    "isCore": true,
    "defaultLight": "var(--graphene-stone-200)",
    "defaultDark": "var(--graphene-stone-700)"
  },
  {
    "name": "accent-foreground",
    "tier": "semantic",
    "category": "Accent",
    "isCore": true,
    "defaultLight": "var(--graphene-stone-900)",
    "defaultDark": "var(--graphene-stone-50)"
  },
  {
    "name": "destructive",
    "tier": "semantic",
    "category": "Destructive",
    "isCore": true,
    "defaultLight": "var(--graphene-red-600)",
    "defaultDark": "var(--graphene-red-400)"
  },
  {
    "name": "destructive-foreground",
    "tier": "semantic",
    "category": "Destructive",
    "isCore": true,
    "defaultLight": "var(--graphene-white)",
    "defaultDark": "var(--graphene-white)"
  },
  {
    "name": "success",
    "tier": "semantic",
    "category": "Success",
    "isCore": true,
    "defaultLight": "var(--graphene-green-600)",
    "defaultDark": "var(--graphene-green-500)"
  },
  {
    "name": "success-foreground",
    "tier": "semantic",
    "category": "Success",
    "isCore": true,
    "defaultLight": "var(--graphene-white)",
    "defaultDark": "var(--graphene-white)"
  },
  {
    "name": "warning",
    "tier": "semantic",
    "category": "Warning",
    "isCore": true,
    "defaultLight": "var(--graphene-amber-500)",
    "defaultDark": "var(--graphene-amber-400)"
  },
  {
    "name": "warning-foreground",
    "tier": "semantic",
    "category": "Warning",
    "isCore": true,
    "defaultLight": "var(--graphene-amber-950)",
    "defaultDark": "var(--graphene-amber-950)"
  },
  {
    "name": "highlight",
    "tier": "semantic",
    "category": "Highlight",
    "isCore": true,
    "defaultLight": "var(--graphene-violet-600)",
    "defaultDark": "var(--graphene-violet-400)"
  },
  {
    "name": "highlight-foreground",
    "tier": "semantic",
    "category": "Highlight",
    "isCore": true,
    "defaultLight": "var(--graphene-white)",
    "defaultDark": "var(--graphene-stone-950)"
  },
  {
    "name": "border",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-stone-200)",
    "defaultDark": "color-mix(in oklab, var(--foreground) 10%, transparent)"
  },
  {
    "name": "input",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-stone-200)",
    "defaultDark": "color-mix(in oklab, var(--foreground) 15%, transparent)"
  },
  {
    "name": "ring",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-solaris-500)",
    "defaultDark": "var(--graphene-solaris-400)"
  },
  {
    "name": "control-border",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-stone-500)",
    "defaultDark": "var(--graphene-stone-500)"
  },
  {
    "name": "overlay-border",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "color-mix(in oklab, var(--foreground) 5%, transparent)",
    "defaultDark": "color-mix(in oklab, var(--foreground) 15%, transparent)"
  },
  {
    "name": "chart-1",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-blue-400)",
    "defaultDark": "var(--graphene-blue-400)"
  },
  {
    "name": "chart-2",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-teal-400)",
    "defaultDark": "var(--graphene-teal-400)"
  },
  {
    "name": "chart-3",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-green-500)",
    "defaultDark": "var(--graphene-green-500)"
  },
  {
    "name": "chart-4",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-amber-400)",
    "defaultDark": "var(--graphene-amber-400)"
  },
  {
    "name": "chart-5",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-violet-400)",
    "defaultDark": "var(--graphene-violet-400)"
  },
  {
    "name": "chart-6",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-rose-400)",
    "defaultDark": "var(--graphene-rose-400)"
  },
  {
    "name": "chart-7",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-solaris-400)",
    "defaultDark": "var(--graphene-solaris-400)"
  },
  {
    "name": "chart-8",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-indigo-400)",
    "defaultDark": "var(--graphene-indigo-400)"
  },
  {
    "name": "chart-9",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-lime-400)",
    "defaultDark": "var(--graphene-lime-400)"
  },
  {
    "name": "chart-10",
    "tier": "semantic",
    "category": "Other",
    "isCore": false,
    "defaultLight": "var(--graphene-cyan-400)",
    "defaultDark": "var(--graphene-cyan-400)"
  }
];

export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  {
    "id": "card",
    "label": "Card",
    "background": "card",
    "foreground": "card-foreground",
    "isCore": true
  },
  {
    "id": "popover",
    "label": "Popover",
    "background": "popover",
    "foreground": "popover-foreground",
    "isCore": false
  },
  {
    "id": "primary",
    "label": "Primary (Brand)",
    "background": "primary",
    "foreground": "primary-foreground",
    "isCore": true
  },
  {
    "id": "secondary",
    "label": "Secondary",
    "background": "secondary",
    "foreground": "secondary-foreground",
    "isCore": true
  },
  {
    "id": "muted",
    "label": "Muted",
    "background": "muted",
    "foreground": "muted-foreground",
    "isCore": true
  },
  {
    "id": "accent",
    "label": "Accent",
    "background": "accent",
    "foreground": "accent-foreground",
    "isCore": true
  },
  {
    "id": "destructive",
    "label": "Destructive",
    "background": "destructive",
    "foreground": "destructive-foreground",
    "isCore": true
  },
  {
    "id": "success",
    "label": "Success",
    "background": "success",
    "foreground": "success-foreground",
    "isCore": true
  },
  {
    "id": "warning",
    "label": "Warning",
    "background": "warning",
    "foreground": "warning-foreground",
    "isCore": true
  },
  {
    "id": "highlight",
    "label": "Highlight",
    "background": "highlight",
    "foreground": "highlight-foreground",
    "isCore": true
  }
];
