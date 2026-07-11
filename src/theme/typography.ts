export const fonts = {
  display: 'RussoOne',
  body: 'ChakraPetch',
  bodyMedium: 'ChakraPetch-Medium',
  bodySemiBold: 'ChakraPetch-SemiBold',
  bodyBold: 'ChakraPetch-Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  hero: 42,
} as const;

export type FontFamily = typeof fonts[keyof typeof fonts];
export type FontSize = typeof fontSize[keyof typeof fontSize];
