import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText, AppIcon, useTheme } from '@/design-system';
import { useRestTimer } from '@/hooks/useRestTimer';

export interface RestTimerProps {
  onManualStart?: () => void;
  style?: any;
}

export const RestTimer: React.FC<RestTimerProps> = ({ style }) => {
  const { colors, spacing, radii, layout, shadows } = useTheme();
  const {
    status,
    remainingDisplay,
    isIdle,
    isPaused,
    isCompleted,
    pauseRest,
    resumeRest,
    addThirtySeconds,
    skipRest,
    dismissCompleted,
  } = useRestTimer();

  // If idle, do not render the floating timer bar
  if (isIdle) {
    return null;
  }

  return (
    <View
      style={[
        styles.floatingContainer,
        {
          backgroundColor: colors.background.elevated,
          borderColor: isCompleted
            ? colors.semantic.success
            : colors.border.default,
          borderRadius: radii.medium,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          ...shadows.subtle,
        },
        style,
      ]}
      accessibilityRole="timer"
      accessibilityLabel={
        isCompleted
          ? 'Rest complete. Tap to dismiss.'
          : `Rest timer: ${remainingDisplay} remaining. Status: ${status}.`
      }
    >
      {/* 1. Timer Display / Status */}
      <View style={styles.timeSection}>
        {isCompleted ? (
          <Pressable
            onPress={dismissCompleted}
            accessibilityRole="button"
            accessibilityLabel="Rest Complete. Tap to dismiss."
            style={styles.completedInfoRow}
          >
            <View
              style={[
                styles.completedIconBadge,
                {
                  backgroundColor: colors.semantic.successSurface,
                  borderRadius: radii.small,
                  marginRight: spacing.xs,
                },
              ]}
            >
              <AppIcon name="check" size="xs" color="success" />
            </View>
            <AppText variant="body" weight="bold" color="primary">
              Rest Complete
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.runningInfoRow}>
            <AppIcon
              name="clock"
              size="xs"
              color={isPaused ? 'warning' : 'secondary'}
              style={{ marginRight: 6 }}
            />
            <AppText
              variant="heading"
              weight="bold"
              color={isPaused ? 'secondary' : 'primary'}
              style={[
                styles.timeText,
                {
                  fontVariant: ['tabular-nums'],
                },
              ]}
            >
              {remainingDisplay}
            </AppText>
            {isPaused && (
              <View
                style={[
                  styles.pausedBadge,
                  {
                    backgroundColor: colors.semantic.warningSurface,
                    borderRadius: radii.small,
                    marginLeft: 6,
                  },
                ]}
              >
                <AppText variant="caption" weight="bold" color="warning">
                  PAUSED
                </AppText>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 2. Control Actions */}
      <View style={styles.actionsSection}>
        {isCompleted ? (
          <Pressable
            onPress={dismissCompleted}
            accessibilityRole="button"
            accessibilityLabel="Dismiss rest complete banner"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [
              styles.actionButton,
              {
                minHeight: layout.minTouchTarget,
                minWidth: layout.minTouchTarget,
                backgroundColor: colors.action.secondary.background,
                borderRadius: radii.small,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <AppText variant="secondary" weight="bold">
              Done
            </AppText>
          </Pressable>
        ) : (
          <>
            {/* Pause / Resume Button */}
            <Pressable
              onPress={isPaused ? resumeRest : pauseRest}
              accessibilityRole="button"
              accessibilityLabel={isPaused ? 'Resume rest timer' : 'Pause rest timer'}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  minHeight: layout.minTouchTarget,
                  minWidth: layout.minTouchTarget,
                  backgroundColor: colors.action.secondary.background,
                  borderRadius: radii.small,
                  opacity: pressed ? 0.7 : 1,
                  marginRight: spacing.xs,
                },
              ]}
            >
              <AppIcon
                name={isPaused ? 'play' : 'pause'}
                size="xs"
                color="primary"
                style={{ marginRight: 4 }}
              />
              <AppText variant="caption" weight="bold">
                {isPaused ? 'Resume' : 'Pause'}
              </AppText>
            </Pressable>

            {/* +30s Button */}
            <Pressable
              onPress={addThirtySeconds}
              accessibilityRole="button"
              accessibilityLabel="Add 30 seconds to rest timer"
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  minHeight: layout.minTouchTarget,
                  minWidth: 44,
                  backgroundColor: colors.action.secondary.background,
                  borderRadius: radii.small,
                  opacity: pressed ? 0.7 : 1,
                  marginRight: spacing.xs,
                },
              ]}
            >
              <AppText variant="caption" weight="bold">
                +30s
              </AppText>
            </Pressable>

            {/* Skip Button */}
            <Pressable
              onPress={skipRest}
              accessibilityRole="button"
              accessibilityLabel="Skip rest timer"
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  minHeight: layout.minTouchTarget,
                  minWidth: 44,
                  backgroundColor: colors.action.secondary.background,
                  borderRadius: radii.small,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <AppText variant="caption" weight="bold" color="tertiary">
                Skip
              </AppText>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    minHeight: 56,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  runningInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    letterSpacing: 0.5,
  },
  pausedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  completedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedIconBadge: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
