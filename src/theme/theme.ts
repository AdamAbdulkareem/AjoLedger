export const colors = {
  brand: "#FECB01",
  textPrimary: "#2C3138",
  textSecondary: "#404751",
  textMuted: "#6D7888",
  surface: "#FFFFFF",
  dotInactive: "#E2E6EC",
  inputBorder: "#DFE3E9",
  error: "#D32F2F",
  errorBorder: "#F75C5C",
  link: "#FECB01",
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
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    lineHeight: 24,
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
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
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
