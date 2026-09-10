import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { TypographyVariant, fontWeights } from '../../tokens/typography';

export type TextColorVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'success'
  | 'warning'
  | 'destructive';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColorVariant | string;
  weight?: keyof typeof fontWeights;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  style,
  children,
  ...rest
}) => {
  const { colors, typography } = useTheme();

  const variantStyle = typography[variant] || typography.body;

  const resolvedColor = ((): string => {
    switch (color as TextColorVariant) {
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

  const computedStyle: TextStyle = {
    ...variantStyle,
    color: resolvedColor,
    ...(weight ? { fontWeight: fontWeights[weight] } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  return (
    <Text style={[computedStyle, style]} {...rest}>
      {children}
    </Text>
  );
};
