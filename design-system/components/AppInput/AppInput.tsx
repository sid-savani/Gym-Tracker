import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../AppText/AppText';
import { AppIcon } from '../../icons/AppIcon';
import { IconName } from '../../icons/types';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  containerStyle,
  inputStyle,
  placeholder,
  value,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { colors, radii, spacing, layout, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  // Resolve border color based on state
  const getBorderColor = (): string => {
    if (hasError) {
      return colors.input.borderError;
    }
    if (isFocused) {
      return colors.input.borderFocused;
    }
    return colors.input.border;
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText
          variant="secondary"
          weight="medium"
          color={hasError ? 'destructive' : isFocused ? 'primary' : 'secondary'}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </AppText>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: disabled
              ? colors.input.disabledBackground
              : colors.input.background,
            borderColor: getBorderColor(),
            borderRadius: radii.medium,
            minHeight: layout.minTouchTarget,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {leftIcon && (
          <AppIcon
            name={leftIcon}
            size="sm"
            color={hasError ? 'destructive' : isFocused ? 'primary' : 'secondary'}
            style={{ marginRight: spacing.xs }}
          />
        )}

        <TextInput
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={colors.input.placeholder}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label || placeholder}
          accessibilityState={{ disabled }}
          style={[
            styles.textInput,
            typography.body,
            {
              color: disabled ? colors.text.tertiary : colors.input.text,
            },
            inputStyle,
          ]}
          {...rest}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress || disabled}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppIcon
              name={rightIcon}
              size="sm"
              color={hasError ? 'destructive' : 'secondary'}
              style={{ marginLeft: spacing.xs }}
            />
          </Pressable>
        )}
      </View>

      {hasError ? (
        <AppText
          variant="caption"
          color="destructive"
          style={{ marginTop: spacing.xxs }}
        >
          {error}
        </AppText>
      ) : helperText ? (
        <AppText
          variant="caption"
          color="tertiary"
          style={{ marginTop: spacing.xxs }}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 48,
  },
  textInput: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
});
