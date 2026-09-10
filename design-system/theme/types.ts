import { ThemeColors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, layout } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorSchemeName = 'light' | 'dark';

export interface ThemeContextValue {
  colorScheme: ColorSchemeName;
  isDark: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  layout: typeof layout;
  radii: typeof radii;
  shadows: typeof shadows;
  setThemeMode: (mode: ThemeMode) => void;
}
