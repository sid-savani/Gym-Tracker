/**
 * Design System - Typography Tokens
 * Native/System typography scale with dedicated workout data variants.
 */

import { Platform, TextStyle } from 'react-native';

export const fontFamilies = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'ui-monospace',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto',
    semibold: 'Roboto',
    bold: 'Roboto',
    mono: 'monospace',
  },
  default: {
    regular: 'system-ui',
    medium: 'system-ui',
    semibold: 'system-ui',
    bold: 'system-ui',
    mono: 'monospace',
  },
});

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export type TypographyVariant =
  | 'display'
  | 'largeTitle'
  | 'title'
  | 'heading'
  | 'body'
  | 'secondary'
  | 'caption'
  | 'workoutWeight'
  | 'workoutReps'
  | 'workoutSets'
  | 'workoutTimer'
  | 'workoutMetric'
  | 'workoutPR';

export const typography: Record<TypographyVariant, TextStyle> = {
  // Standard Semantic Typography
  display: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.37,
  },
  largeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.36,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.35,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeights.regular,
    letterSpacing: -0.1,
  },
  secondary: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  },

  // Dedicated Workout-Data Typography
  workoutWeight: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  workoutReps: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  workoutSets: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: fontWeights.semibold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  workoutTimer: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  workoutMetric: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  workoutPR: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
};
