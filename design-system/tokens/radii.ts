/**
 * Design System - Corner Radii Tokens
 * Restrained radius scale for intentional hierarchy.
 */

export const radii = {
  none: 0,
  small: 8,
  medium: 12,
  large: 16,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radii;
