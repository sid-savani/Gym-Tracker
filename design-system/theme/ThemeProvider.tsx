import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { lightColors, darkColors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, layout } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';
import { ThemeContextValue, ThemeMode, ColorSchemeName } from './types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'system',
}) => {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);

  const activeColorScheme: ColorSchemeName = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDark = activeColorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value: ThemeContextValue = useMemo(
    () => ({
      colorScheme: activeColorScheme,
      isDark,
      themeMode,
      colors,
      typography,
      spacing,
      layout,
      radii,
      shadows,
      setThemeMode,
    }),
    [activeColorScheme, isDark, themeMode, colors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside ThemeProvider
    // Default to dark mode given the dark-first monochrome identity
    return {
      colorScheme: 'dark',
      isDark: true,
      themeMode: 'dark',
      colors: darkColors,
      typography,
      spacing,
      layout,
      radii,
      shadows,
      setThemeMode: () => {},
    };
  }
  return context;
};
