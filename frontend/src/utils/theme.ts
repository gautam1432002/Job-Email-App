import { useColorScheme } from 'react-native';

export const LightTheme = {
  background: '#F2F2F7',
  cardSurface: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  accent: '#007AFF',
  border: '#E5E5EA',
};

export const DarkTheme = {
  background: '#000000',
  cardSurface: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  accent: '#0A84FF',
  border: '#38383A',
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
