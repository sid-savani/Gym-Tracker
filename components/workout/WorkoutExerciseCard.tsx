import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText, AppIcon, useTheme } from '@/design-system';
import {
  WorkoutExercise,
  SetType,
  UpdateSetInput,
} from '@/data';
import { SetRow } from './SetRow';
import { ExerciseActionSheet } from './ExerciseActionSheet';

export interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
  previousPerformanceText?: string | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdateSetValues: (
    setId: string,
    workoutExerciseId: string,
    updates: Partial<UpdateSetInput>
  ) => void;
  onToggleSetCompletion: (setId: string, workoutExerciseId: string) => void;
  onChangeSetType: (
    setId: string,
    workoutExerciseId: string,
    setType: SetType
  ) => void;
  onAddSet: (workoutExerciseId: string) => void;
  onDeleteSet: (setId: string, workoutExerciseId: string) => void;
  onReplaceExercise: (workoutExerciseId: string) => void;
  onMoveExercise: (workoutExerciseId: string, direction: 'up' | 'down') => void;
  onRemoveExercise: (workoutExerciseId: string) => void;
}

export const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({
  workoutExercise,
  previousPerformanceText,
  canMoveUp,
  canMoveDown,
  onUpdateSetValues,
  onToggleSetCompletion,
  onChangeSetType,
  onAddSet,
  onDeleteSet,
  onReplaceExercise,
  onMoveExercise,
  onRemoveExercise,
}) => {
  const { colors, spacing, radii, layout } = useTheme();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const exercise = workoutExercise.exercise;
  if (!exercise) return null;

  const formatTag = (str: string) => {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isDurationOnly =
    exercise.exerciseType === 'duration' ||
    (exercise.trackingMetrics?.includes('duration') &&
      !exercise.trackingMetrics?.includes('reps'));

  const isDistanceDuration = exercise.exerciseType === 'distance_duration';

  const sets = workoutExercise.sets || [];

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
          marginBottom: spacing.lg,
        },
      ]}
    >
      {/* 1. Exercise Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
          <AppText variant="title" weight="bold" numberOfLines={1}>
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

        {/* 3-Dots Context Menu Button */}
        <Pressable
          onPress={() => setIsActionSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Exercise options for ${exercise.name}`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => [
            styles.moreButton,
            {
              minHeight: layout.minTouchTarget,
              minWidth: layout.minTouchTarget,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <AppIcon name="more-horizontal" size="md" color="secondary" />
        </Pressable>
      </View>

      {/* 2. Previous Performance (if available) */}
      {previousPerformanceText ? (
        <View
          style={[
            styles.previousRow,
            {
              marginTop: spacing.xs,
              marginBottom: spacing.xs,
              backgroundColor: colors.background.elevated,
              borderRadius: radii.small,
              paddingVertical: 4,
              paddingHorizontal: 8,
            },
          ]}
        >
          <AppText variant="caption" color="secondary" weight="semibold">
            Previous:{' '}
          </AppText>
          <AppText variant="caption" color="primary">
            {previousPerformanceText}
          </AppText>
        </View>
      ) : null}

      {/* 3. Column Headers */}
      <View
        style={[
          styles.columnHeadersRow,
          {
            marginTop: spacing.sm,
            paddingBottom: spacing.xs,
            borderBottomColor: colors.border.subtle,
            borderBottomWidth: 1,
          },
        ]}
      >
        <AppText
          variant="caption"
          weight="bold"
          color="tertiary"
          style={styles.colSet}
        >
          SET
        </AppText>

        <View style={styles.colInputs}>
          {!isDurationOnly && !isDistanceDuration && (
            <>
              <AppText
                variant="caption"
                weight="bold"
                color="tertiary"
                align="center"
                style={{ flex: 1 }}
              >
                KG
              </AppText>
              <AppText
                variant="caption"
                weight="bold"
                color="tertiary"
                align="center"
                style={{ flex: 1 }}
              >
                REPS
              </AppText>
            </>
          )}

          {isDurationOnly && (
            <AppText
              variant="caption"
              weight="bold"
              color="tertiary"
              align="center"
              style={{ flex: 1 }}
            >
              TIME (S)
            </AppText>
          )}

          {isDistanceDuration && (
            <>
              <AppText
                variant="caption"
                weight="bold"
                color="tertiary"
                align="center"
                style={{ flex: 1 }}
              >
                METERS
              </AppText>
              <AppText
                variant="caption"
                weight="bold"
                color="tertiary"
                align="center"
                style={{ flex: 1 }}
              >
                TIME (S)
              </AppText>
            </>
          )}
        </View>

        <AppText
          variant="caption"
          weight="bold"
          color="tertiary"
          align="center"
          style={styles.colCheck}
        >
          ✓
        </AppText>
      </View>

      {/* 4. Set Rows */}
      <View style={{ marginTop: spacing.xs }}>
        {sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            exercise={exercise}
            onUpdateValues={(updates) =>
              onUpdateSetValues(set.id, workoutExercise.id, updates)
            }
            onToggleCompletion={() =>
              onToggleSetCompletion(set.id, workoutExercise.id)
            }
            onChangeType={(type) =>
              onChangeSetType(set.id, workoutExercise.id, type)
            }
            onDeleteSet={() => onDeleteSet(set.id, workoutExercise.id)}
          />
        ))}
      </View>

      {/* 5. + Add Set Button */}
      <Pressable
        onPress={() => onAddSet(workoutExercise.id)}
        accessibilityRole="button"
        accessibilityLabel={`Add set to ${exercise.name}`}
        style={({ pressed }) => [
          styles.addSetButton,
          {
            marginTop: spacing.sm,
            minHeight: layout.minTouchTarget,
            borderRadius: radii.small,
            backgroundColor: pressed
              ? colors.action.secondary.pressed
              : colors.action.secondary.background,
          },
        ]}
      >
        <AppIcon name="plus" size="xs" color="primary" style={{ marginRight: 6 }} />
        <AppText variant="secondary" weight="semibold">
          Add Set
        </AppText>
      </Pressable>

      {/* Exercise Action Sheet */}
      <ExerciseActionSheet
        visible={isActionSheetOpen}
        exerciseName={exercise.name}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onReplace={() => onReplaceExercise(workoutExercise.id)}
        onMoveUp={() => onMoveExercise(workoutExercise.id, 'up')}
        onMoveDown={() => onMoveExercise(workoutExercise.id, 'down')}
        onRemove={() => onRemoveExercise(workoutExercise.id)}
        onClose={() => setIsActionSheetOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  moreButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  columnHeadersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  colSet: {
    width: 36,
    textAlign: 'center',
  },
  colInputs: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
  },
  colCheck: {
    width: 44,
    textAlign: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
