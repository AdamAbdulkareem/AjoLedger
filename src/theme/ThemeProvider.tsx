import { createContext, useContext, useMemo, type ReactNode } from "react";

import { theme as lightTheme, type Theme } from "./theme";

const ThemeContext = createContext<Theme>(lightTheme);

/**
 * Provides the active theme to the component tree.
 *
 * For now this serves a single light theme. It is the single place where
 * runtime theme switching (high-contrast, large-text, dark mode) will plug in
 * later, so screens and components never hardcode a theme import.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => lightTheme, []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
