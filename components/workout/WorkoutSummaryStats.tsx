import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, useTheme } from '@/design-system';

export interface WorkoutSummaryStatsProps {
  duration: string;
  exerciseCount: number;
  completedSetsCount: number;
  totalVolumeKg?: number | null;
}

export const WorkoutSummaryStats: React.FC<WorkoutSummaryStatsProps> = ({
  duration,
  exerciseCount,
  completedSetsCount,
  totalVolumeKg,
}) => {
  const { colors, spacing, radii } = useTheme();

  const formatVolume = (vol?: number | null): string => {
    if (vol === undefined || vol === null || vol <= 0) {
      return '0 kg';
    }
    return `${Math.round(vol).toLocaleString()} kg`;
  };

  const hasVolume = totalVolumeKg !== undefined && totalVolumeKg !== null && totalVolumeKg > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.surface,
          borderColor: colors.border.subtle,
          borderRadius: radii.medium,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          marginBottom: spacing.lg,
        },
      ]}
    >
      {/* Duration */}
      <View style={styles.statItem}>
        <AppText variant="caption" color="tertiary" weight="bold" style={styles.statLabel}>
          DURATION
        </AppText>
        <AppText
          variant="title"
          weight="bold"
          align="center"
          numberOfLines={1}
          style={styles.statValue}
        >
          {duration}
        </AppText>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

      {/* Exercises */}
      <View style={styles.statItem}>
        <AppText variant="caption" color="tertiary" weight="bold" style={styles.statLabel}>
          EXERCISES
        </AppText>
        <AppText
          variant="title"
          weight="bold"
          align="center"
          numberOfLines={1}
          style={styles.statValue}
        >
          {exerciseCount}
        </AppText>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

      {/* Completed Sets */}
      <View style={styles.statItem}>
        <AppText variant="caption" color="tertiary" weight="bold" style={styles.statLabel}>
          SETS
        </AppText>
        <AppText
          variant="title"
          weight="bold"
          align="center"
          numberOfLines={1}
          style={styles.statValue}
        >
          {completedSetsCount}
        </AppText>
      </View>

      {/* Volume (if available) */}
      {hasVolume && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
          <View style={styles.statItem}>
            <AppText variant="caption" color="tertiary" weight="bold" style={styles.statLabel}>
              VOLUME
            </AppText>
            <AppText
              variant="title"
              weight="bold"
              align="center"
              numberOfLines={1}
              style={styles.statValue}
            >
              {formatVolume(totalVolumeKg)}
            </AppText>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontVariant: ['tabular-nums'],
    fontSize: 16,
    lineHeight: 20,
  },
  divider: {
    width: 1,
    height: 28,
  },
});
