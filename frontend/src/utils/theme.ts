import { useColorScheme } from 'react-native';

export const LightTheme = {
  background: '#F2F2F7',
  cardSurface: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  accent: '#007AFF', // Legacy, keep if needed
  border: '#E5E5EA',
  neonCyan: '#00F0FF',
  deepViolet: '#8A2BE2',
  emerald: '#00FF66',
};

export const DarkTheme = {
  background: '#000000',
  cardSurface: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  accent: '#0A84FF', // Legacy, keep if needed
  border: '#38383A',
  neonCyan: '#00F0FF',
  deepViolet: '#8A2BE2',
  emerald: '#00FF66',
};

export const useAppTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? DarkTheme : LightTheme;

  return {
    isDark,
    colors,
  };
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
};

export const shadows = {
  glowCyan: {
    textShadowColor: 'rgba(0, 240, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  glowEmerald: {
    textShadowColor: 'rgba(0, 255, 102, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  glowBoxCyan: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  }
};
