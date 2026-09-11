/**
 * Overrides SidebarMenuButton/SidebarMenuSubButton's default active-state
 * colors (Graphene's neutral `--sidebar-accent`, the same token hover uses)
 * with a subtle primary tint. Merged in via `cn()`/tailwind-merge inside
 * those components, so this replaces rather than stacks on top of Graphene's
 * own `data-active:bg-sidebar-accent` / `data-active:text-sidebar-accent-foreground`.
 * See `--sidebar-active-background` / `--sidebar-active-foreground` in
 * src/app.css for the tokens themselves (icon color follows text color via
 * `currentColor`, so one class covers both).
 *
 * Apply to every SidebarMenuButton/SidebarMenuSubButton with an `isActive` prop,
 * so the active state reads consistently across every sidebar nav list.
 */
export const SIDEBAR_NAV_ACTIVE_CLASS = 'data-active:bg-sidebar-active-background data-active:text-sidebar-active-foreground';
