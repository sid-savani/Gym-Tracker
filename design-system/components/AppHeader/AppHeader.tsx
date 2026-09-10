import React, { ReactNode } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../AppText/AppText';
import { AppIcon } from '../../icons/AppIcon';
import { IconName } from '../../icons/types';
import { AppDivider } from '../AppDivider/AppDivider';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: IconName;
  onLeftPress?: () => void;
  leftAccessibilityLabel?: string;
  leftSlot?: ReactNode;
  rightIcon?: IconName;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  rightSlot?: ReactNode;
  showDivider?: boolean;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  leftAccessibilityLabel = 'Back',
  leftSlot,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel,
  rightSlot,
  showDivider = false,
  style,
}) => {
  const { spacing, layout } = useTheme();

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          {
            height: layout.headerHeight,
            paddingHorizontal: spacing.sm,
          },
        ]}
      >
        {/* Left Action Area */}
        <View style={styles.actionContainer}>
          {leftSlot ? (
            leftSlot
          ) : leftIcon && onLeftPress ? (
            <Pressable
              onPress={onLeftPress}
              accessibilityRole="button"
              accessibilityLabel={leftAccessibilityLabel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  opacity: pressed ? 0.6 : 1,
                  minHeight: layout.minTouchTarget,
                  minWidth: layout.minTouchTarget,
                },
              ]}
            >
              <AppIcon name={leftIcon} size="md" color="primary" />
            </Pressable>
          ) : null}
        </View>

        {/* Title Area */}
        <View style={styles.titleContainer}>
          <AppText
            variant="heading"
            weight="semibold"
            align="center"
            numberOfLines={1}
          >
            {title}
          </AppText>
          {subtitle && (
            <AppText
              variant="caption"
              color="secondary"
              align="center"
              numberOfLines={1}
              style={{ marginTop: 2 }}
            >
              {subtitle}
            </AppText>
          )}
        </View>

        {/* Right Action Area */}
        <View style={[styles.actionContainer, styles.actionRight]}>
          {rightSlot ? (
            rightSlot
          ) : rightIcon && onRightPress ? (
            <Pressable
              onPress={onRightPress}
              accessibilityRole="button"
              accessibilityLabel={rightAccessibilityLabel || 'Action'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  opacity: pressed ? 0.6 : 1,
                  minHeight: layout.minTouchTarget,
                  minWidth: layout.minTouchTarget,
                },
              ]}
            >
              <AppIcon name={rightIcon} size="md" color="primary" />
            </Pressable>
          ) : null}
        </View>
      </View>
      {showDivider && <AppDivider variant="subtle" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionContainer: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  actionRight: {
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
