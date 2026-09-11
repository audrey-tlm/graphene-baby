import { ToggleGroup, ToggleGroupItem, useTheme, type ThemeMode } from '@gravitee/graphene-core';

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
];

/** Lets a designer preview the current theme in both of Graphene's light/dark modes, not just whichever the OS happens to be in. */
export function ThemeModeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={mode}
      onValueChange={(value) => {
        if (value) setMode(value as ThemeMode);
      }}
    >
      {MODES.map((m) => (
        <ToggleGroupItem key={m.value} value={m.value} aria-label={`${m.label} mode`}>
          {m.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
