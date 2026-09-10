/**
 * Design System - Elevation & Shadow Tokens
 * Minimal, subtle shadows for sheet / modal elevation.
 */

import { ViewStyle } from 'react-native';

export const shadows: {
  none: ViewStyle;
  subtle: ViewStyle;
  modal: ViewStyle;
} = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 8,
  },
};
