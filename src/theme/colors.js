// GameVerse Color Palette — Copper Theme
// Mirrors the web CSS variables exactly

export const colors = {
  dark: {
    bgPrimary: '#100E0C',
    bgSecondary: '#1B1815',
    bgTertiary: '#26221E',
    bgCard: 'rgba(27, 24, 21, 0.92)',
    bgSurface: 'rgba(255, 255, 255, 0.04)',
    bgSurfaceHover: 'rgba(255, 255, 255, 0.08)',
    bgInput: 'rgba(255, 255, 255, 0.06)',

    glassBg: 'rgba(255, 255, 255, 0.04)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',

    textPrimary: '#E8E0D8',
    textSecondary: '#9E958C',
    textMuted: '#6B6460',
    textInverse: '#100E0C',

    accentPrimary: '#C4845E',
    accentPrimaryLight: '#D4A07E',
    accentPrimaryGlow: 'rgba(196, 132, 94, 0.2)',
    accentSecondary: '#9a5d3c',
    accentCta: '#C4845E',
    accentSuccess: '#5DAA72',
    accentWarning: '#D4A04E',
    accentDanger: '#C85A5A',

    boardBg: '#1A3558',
    boardBgDark: '#132844',
    boardCell: 'rgba(0, 0, 0, 0.35)',
  },

  light: {
    bgPrimary: '#dee4ed',
    bgSecondary: '#FFFFFF',
    bgTertiary: '#CDD4DF',
    bgCard: 'rgba(255, 255, 255, 0.92)',
    bgSurface: 'rgba(0, 0, 0, 0.04)',
    bgSurfaceHover: 'rgba(0, 0, 0, 0.07)',
    bgInput: 'rgba(0, 0, 0, 0.04)',

    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(0, 0, 0, 0.1)',

    textPrimary: '#1A1410',
    textSecondary: '#5A5048',
    textMuted: '#7A726A',
    textInverse: '#F5F0EB',

    accentPrimary: '#9a5d3c',
    accentPrimaryLight: '#7A4A2E',
    accentPrimaryGlow: 'rgba(154, 93, 60, 0.12)',
    accentSecondary: '#7A4A2E',
    accentCta: '#9a5d3c',
    accentSuccess: '#3D8A52',
    accentWarning: '#B88A3A',
    accentDanger: '#B84040',

    boardBg: '#2563EB',
    boardBgDark: '#1E40AF',
    boardCell: 'rgba(0, 0, 0, 0.25)',
  },

  // Shared game colors (same in both themes)
  game: {
    discRed: '#C85A5A',
    discYellow: '#D4A04E',
    discRedGlow: 'rgba(200, 90, 90, 0.3)',
    discYellowGlow: 'rgba(212, 160, 78, 0.3)',
    bingoB: '#C85A5A',
    bingoI: '#D4A04E',
    bingoN: '#5DAA72',
    bingoG: '#5A8AC8',
    bingoO: '#9a5d3c',
  },
};

export default colors;
