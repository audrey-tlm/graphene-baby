import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface HelpContentContextValue {
  readonly enabled: boolean;
  readonly toggle: () => void;
}

const HelpContentContext = createContext<HelpContentContextValue | null>(null);

/** App-wide switch for the "Helpful content" mode. Every HelpCallout reads from this instead of owning its own on/off state. */
export function HelpContentProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const value = useMemo(() => ({ enabled, toggle: () => setEnabled((v) => !v) }), [enabled]);

  return <HelpContentContext.Provider value={value}>{children}</HelpContentContext.Provider>;
}

export function useHelpContent(): HelpContentContextValue {
  const ctx = useContext(HelpContentContext);
  if (!ctx) throw new Error('useHelpContent must be used within a HelpContentProvider');
  return ctx;
}
