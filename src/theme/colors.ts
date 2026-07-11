// GameVerse Color Palette — Copper Theme

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgSurface: string;
  bgSurfaceHover: string;
  bgInput: string;
  glassBg: string;
  glassBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  accentPrimary: string;
  accentPrimaryLight: string;
  accentPrimaryGlow: string;
  accentSecondary: string;
  accentCta: string;
  accentSuccess: string;
  accentWarning: string;
  accentDanger: string;
  boardBg: string;
  boardBgDark: string;
  boardCell: string;
}

export interface GameColors {
  discRed: string;
  discYellow: string;
  discRedGlow: string;
  discYellowGlow: string;
  bingoB: string;
  bingoI: string;
  bingoN: string;
  bingoG: string;
  bingoO: string;
}

const dark: ThemeColors = {
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
};

const light: ThemeColors = {
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
};

export const gameColors: GameColors = {
  discRed: '#C85A5A',
  discYellow: '#D4A04E',
  discRedGlow: 'rgba(200, 90, 90, 0.3)',
  discYellowGlow: 'rgba(212, 160, 78, 0.3)',
  bingoB: '#C85A5A',
  bingoI: '#D4A04E',
  bingoN: '#5DAA72',
  bingoG: '#5A8AC8',
  bingoO: '#9a5d3c',
};

export const colors = { dark, light, game: gameColors };
export default colors;
