import { useMemo } from "react";

import { useTheme } from "./ThemeProvider";
import type { Theme } from "./theme";

/**
 * Builds a StyleSheet (or any style object) from the active theme, recomputing
 * only when the theme changes.
 *
 * Convention: define the `factory` at module scope so its identity is stable
 * and the memoization is effective, e.g.
 *
 *   const createStyles = (theme: Theme) => StyleSheet.create({ ... });
 *   // inside the component:
 *   const styles = useThemedStyles(createStyles);
 */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();

  return useMemo(() => factory(theme), [theme, factory]);
}
