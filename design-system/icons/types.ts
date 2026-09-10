import { ComponentProps } from 'react';
import Feather from '@expo/vector-icons/Feather';

export type IconName = ComponentProps<typeof Feather>['name'];

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export type IconColorVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'success'
  | 'warning'
  | 'destructive';

export interface AppIconProps {
  /**
   * Standardized icon name from the approved Feather icon set
   */
  name: IconName;
  /**
   * Semantic size token or exact numeric size
   * - xs: 16px (secondary metadata)
   * - sm: 20px (compact controls)
   * - md: 24px (standard controls, default)
   * - lg: 32px (large controls)
   * - xl: 40px (display icons)
   */
  size?: IconSize;
  /**
   * Semantic color variant or exact hex color string
   * Defaults to 'primary' text color from the active theme
   */
  color?: IconColorVariant | string;
  /**
   * Optional accessibility label
   */
  accessibilityLabel?: string;
  /**
   * Optional style overrides
   */
  style?: ComponentProps<typeof Feather>['style'];
}
