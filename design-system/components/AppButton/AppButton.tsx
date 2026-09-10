import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../AppText/AppText';
import { AppIcon } from '../../icons/AppIcon';
import { IconName } from '../../icons/types';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  onPress,
  accessibilityLabel,
  ...rest
}) => {
  const { colors, radii, spacing, layout } = useTheme();

  const isInteractive = !disabled && !loading;

  // Determine button size parameters
  const height = size === 'sm' ? 40 : size === 'lg' ? 56 : 48;
  const paddingHorizontal = size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg;
  const borderRadius = radii.medium;

  // Determine colors based on variant and state
  const getBackgroundColor = (isPressed: boolean): string => {
    if (disabled) {
      return colors.action.disabled.background;
    }

    switch (variant) {
      case 'primary':
        return isPressed ? colors.action.primary.pressed : colors.action.primary.background;
      case 'secondary':
        return isPressed ? colors.action.secondary.pressed : colors.action.secondary.background;
      case 'destructive':
        return isPressed ? colors.action.destructive.pressed : colors.action.destructive.background;
      default:
        return colors.action.primary.background;
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return colors.action.disabled.text;
    }

    switch (variant) {
      case 'primary':
        return colors.action.primary.text;
      case 'secondary':
        return colors.action.secondary.text;
      case 'destructive':
        return colors.action.destructive.text;
      default:
        return colors.action.primary.text;
    }
  };

  const textColor = getTextColor();
  const iconSize = size === 'sm' ? 18 : 20;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          paddingHorizontal,
          borderRadius,
          backgroundColor: getBackgroundColor(pressed && isInteractive),
          minHeight: layout.minTouchTarget,
          minWidth: layout.minTouchTarget,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <AppIcon
              name={icon}
              size={iconSize}
              color={textColor}
              style={{ marginRight: spacing.xs }}
            />
          )}
          <AppText
            variant={size === 'sm' ? 'secondary' : 'body'}
            weight="semibold"
            style={{ color: textColor }}
          >
            {title}
          </AppText>
          {icon && iconPosition === 'right' && (
            <AppIcon
              name={icon}
              size={iconSize}
              color={textColor}
              style={{ marginLeft: spacing.xs }}
            />
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
