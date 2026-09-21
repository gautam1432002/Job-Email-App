import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextData {
  theme: 'light' | 'dark';
  themePreference: ThemeType;
  setThemePreference: (theme: ThemeType) => void;
  themeColors: typeof colors.light;
  typography: typeof typography;
  spacing: typeof spacing;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemeType>('system');

  const isDark = 
    themePreference === 'dark' || 
    (themePreference === 'system' && systemColorScheme === 'dark');
    
  const activeTheme = isDark ? 'dark' : 'light';
  const themeColors = colors[activeTheme];

  return (
    <ThemeContext.Provider value={{
      theme: activeTheme,
      themePreference,
      setThemePreference,
      themeColors,
      typography,
      spacing,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
