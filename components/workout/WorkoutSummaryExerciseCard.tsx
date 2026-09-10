import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, AppIcon, useTheme } from '@/design-system';
import { WorkoutExercise, WorkoutSet } from '@/data';

export interface WorkoutSummaryExerciseCardProps {
  workoutExercise: WorkoutExercise;
}

export const WorkoutSummaryExerciseCard: React.FC<WorkoutSummaryExerciseCardProps> = ({
  workoutExercise,
}) => {
  const { colors, spacing, radii } = useTheme();

  const exercise = workoutExercise.exercise;
  if (!exercise) return null;

  const sets = workoutExercise.sets || [];

  const formatTag = (str: string) => {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getBadgeLabel = (set: WorkoutSet) => {
    switch (set.setType) {
      case 'warmup':
        return 'W';
      case 'drop':
        return 'D';
      case 'failure':
        return 'F';
      case 'working':
      default:
        return String(set.setNumber);
    }
  };

  const getBadgeBgColor = (set: WorkoutSet) => {
    if (set.setType === 'warmup') {
      return colors.background.elevated;
    }
    if (set.setType === 'drop' || set.setType === 'failure') {
      return colors.background.elevated;
    }
    return colors.action.secondary.background;
  };

  const formatSetPerformance = (set: WorkoutSet): string => {
    const parts: string[] = [];

    // Weight & Reps
    if (set.weight !== null && set.weight !== undefined && set.weight > 0) {
      parts.push(`${set.weight} kg`);
    } else if (set.weight === 0) {
      parts.push('0 kg');
    }

    if (set.reps !== null && set.reps !== undefined) {
      if (parts.length > 0) {
        parts.push(`× ${set.reps}`);
      } else {
        parts.push(`${set.reps} reps`);
      }
    }

    // Distance & Duration
    if (set.distance !== null && set.distance !== undefined) {
      parts.push(`${set.distance}m`);
    }

    if (set.duration !== null && set.duration !== undefined) {
      if (parts.length > 0) {
        parts.push(`in ${set.duration}s`);
      } else {
        parts.push(`${set.duration}s`);
      }
    }

    if (set.assistanceWeight !== null && set.assistanceWeight !== undefined && set.assistanceWeight > 0) {
      parts.push(`(-${set.assistanceWeight} kg)`);
    }

    if (parts.length === 0) {
      return set.completedAt ? 'Completed' : 'No data recorded';
    }

    return parts.join(' ');
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background.surface,
          borderRadius: radii.medium,
          borderColor: colors.border.subtle,
          borderWidth: 1,
          padding: spacing.md,
          marginBottom: spacing.md,
        },
      ]}
    >
      {/* Exercise Header */}
      <View style={styles.header}>
        <AppText variant="heading" weight="bold" numberOfLines={1}>
          {exercise.name}
        </AppText>
        <View style={styles.metaRow}>
          <AppText
            variant="caption"
            color="secondary"
            style={{ textTransform: 'capitalize' }}
          >
            {formatTag(exercise.primaryMuscle)}
          </AppText>
          <AppText variant="caption" color="tertiary">
            {' • '}
          </AppText>
          <AppText
            variant="caption"
            color="tertiary"
            style={{ textTransform: 'capitalize' }}
          >
            {formatTag(exercise.equipment)}
          </AppText>
        </View>
      </View>

      {/* Set Breakdown List */}
      <View style={[styles.setsList, { marginTop: spacing.sm }]}>
        {sets.length === 0 ? (
          <AppText variant="caption" color="tertiary" style={{ fontStyle: 'italic' }}>
            No sets recorded
          </AppText>
        ) : (
          sets.map((set) => {
            const isCompleted = !!set.completedAt;
            const performanceText = formatSetPerformance(set);
            const isWarmup = set.setType === 'warmup';

            return (
              <View
                key={set.id}
                style={[
                  styles.setRow,
                  {
                    paddingVertical: 6,
                    borderBottomColor: colors.border.subtle,
                  },
                ]}
              >
                {/* Set Type / Number Badge */}
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getBadgeBgColor(set),
                      borderRadius: radii.small,
                      marginRight: spacing.sm,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    color={
                      isWarmup
                        ? 'tertiary'
                        : set.setType === 'failure'
                        ? 'destructive'
                        : 'primary'
                    }
                  >
                    {getBadgeLabel(set)}
                  </AppText>
                </View>

                {/* Performance Value */}
                <View style={styles.performanceContainer}>
                  <AppText
                    variant="body"
                    weight={isWarmup ? 'regular' : 'semibold'}
                    color={
                      !isCompleted
                        ? 'tertiary'
                        : isWarmup
                        ? 'secondary'
                        : 'primary'
                    }
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {performanceText}
                  </AppText>
                  {!isCompleted && (
                    <AppText
                      variant="caption"
                      color="tertiary"
                      style={{ marginLeft: spacing.xs, fontStyle: 'italic' }}
                    >
                      (incomplete)
                    </AppText>
                  )}
                </View>

                {/* Completed / Incomplete Indicator */}
                <View style={styles.statusIndicator}>
                  {isCompleted ? (
                    <AppIcon name="check" size="xs" color="success" />
                  ) : (
                    <AppText variant="caption" color="tertiary">
                      —
                    </AppText>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  header: {
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  setsList: {
    width: '100%',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
