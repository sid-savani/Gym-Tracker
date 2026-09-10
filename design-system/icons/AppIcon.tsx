import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../theme/ThemeProvider';
import { AppIconProps, IconSize, IconColorVariant } from './types';

const ICON_SIZES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

function resolveSize(size: IconSize): number {
  if (typeof size === 'number') {
    return size;
  }
  return ICON_SIZES[size] ?? ICON_SIZES.md;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 'md',
  color = 'primary',
  accessibilityLabel,
  style,
}) => {
  const { colors } = useTheme();

  const resolvedSize = resolveSize(size);

  const resolvedColor = ((): string => {
    switch (color as IconColorVariant) {
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.secondary;
      case 'tertiary':
        return colors.text.tertiary;
      case 'inverse':
        return colors.text.inverse;
      case 'success':
        return colors.semantic.success;
      case 'warning':
        return colors.semantic.warning;
      case 'destructive':
        return colors.semantic.destructive;
      default:
        return typeof color === 'string' ? color : colors.text.primary;
    }
  })();

  return (
    <Feather
      name={name}
      size={resolvedSize}
      color={resolvedColor}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
      style={style}
    />
  );
};
