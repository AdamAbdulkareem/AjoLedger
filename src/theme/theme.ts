export const colors = {
  brand: "#FECB01",
  textPrimary: "#2C3138",
  textSecondary: "#404751",
  surface: "#FFFFFF",
  dotInactive: "#E2E6EC",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  button: 12,
  pill: 999,
} as const;

export const fontFamily = {
  regular: "Inter_400Regular",
  semibold: "Inter_600SemiBold",
} as const;

export const typography = {
  headline: {
    fontFamily: fontFamily.semibold,
    fontSize: 24,
    lineHeight: 28,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 16,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  fontFamily,
  typography,
} as const;

export type Theme = typeof theme;
