/**
 * Design System - Spacing & Layout Tokens
 * Based on a strict 4-point scale.
 */

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
} as const;

export type SpacingToken = keyof typeof spacing;

export const layout = {
  screenHorizontalPadding: 20,
  minTouchTarget: 44,
  headerHeight: 56,
  bottomSheetHandleWidth: 36,
  bottomSheetHandleHeight: 4,
  dividerThickness: 1,
} as const;
