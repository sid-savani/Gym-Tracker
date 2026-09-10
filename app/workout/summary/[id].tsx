import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Screen,
  AppText,
  AppButton,
  AppIcon,
  useTheme,
} from '@/design-system';
import {
  workoutRepository,
  WorkoutSession,
  formatWorkoutDuration,
  formatSummaryDate,
} from '@/data';
import {
  WorkoutSummaryStats,
  WorkoutSummaryExerciseCard,
} from '@/components/workout';
import { useRestTimer } from '@/hooks/useRestTimer';

export default function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radii, layout } = useTheme();
  const restTimer = useRestTimer();

  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleDone = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  // Handle hardware back on Android to safely return home
  useEffect(() => {
    const backAction = () => {
      handleDone();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [handleDone]);

  // Clean up any residual rest timer state upon mounting summary
  useEffect(() => {
    restTimer.skipRest();
  }, [restTimer]);

  // Fetch persisted workout session from SQLite
  useEffect(() => {
    let isMounted = true;

    async function loadWorkoutData() {
      if (!id) {
        setError('Workout ID missing.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await workoutRepository.getWorkoutSessionById(id);
        if (!isMounted) return;

        if (!data) {
          setError('Workout session not found.');
        } else {
          setWorkout(data);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load workout summary.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadWorkoutData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <Screen withPadding>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.text.tertiary} />
          <AppText
            variant="caption"
            color="tertiary"
            style={{ marginTop: spacing.sm }}
          >
            Loading summary...
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error || !workout) {
    return (
      <Screen withPadding>
        <View style={styles.centerContainer}>
          <AppText variant="heading" weight="bold" color="destructive">
            {error || 'Workout session not found'}
          </AppText>
          <AppText
            variant="secondary"
            color="secondary"
            align="center"
            style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}
          >
            The summary for this workout session could not be retrieved.
          </AppText>
          <AppButton
            title="Return to Home"
            variant="secondary"
            onPress={handleDone}
          />
        </View>
      </Screen>
    );
  }

  const exercises = workout.exercises || [];

  // Calculate metrics factually from SQLite data
  const durationDisplay = formatWorkoutDuration(
    workout.startedAt,
    workout.completedAt
  );

  const dateDisplay = formatSummaryDate(
    workout.completedAt || workout.startedAt
  );

  let completedSetsCount = 0;
  let totalVolumeKg = 0;

  for (const ex of exercises) {
    if (ex.sets) {
      for (const set of ex.sets) {
        if (set.completedAt) {
          completedSetsCount += 1;
          if (
            set.weight !== null &&
            set.weight > 0 &&
            set.reps !== null &&
            set.reps > 0
          ) {
            totalVolumeKg += set.weight * set.reps;
          }
        }
      }
    }
  }

  return (
    <Screen scrollable={false} withPadding={false}>
      {/* Top Header Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingVertical: spacing.sm,
            borderBottomColor: colors.border.subtle,
            borderBottomWidth: 1,
          },
        ]}
      >
        <Pressable
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Close summary and return to home"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => [
            styles.iconButton,
            {
              minHeight: layout.minTouchTarget,
              minWidth: layout.minTouchTarget,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <AppIcon name="x" size="md" color="primary" />
        </Pressable>

        <AppText variant="secondary" weight="bold" color="secondary">
          Summary
        </AppText>

        <Pressable
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Done"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => [
            styles.doneTextButton,
            {
              minHeight: layout.minTouchTarget,
              minWidth: layout.minTouchTarget,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <AppText variant="secondary" weight="bold" color="primary">
            Done
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xxl + 80, // Space for fixed bottom done button
          },
        ]}
      >
        {/* Workout Complete Title Header */}
        <View style={styles.titleSection}>
          <View
            style={[
              styles.completeBadge,
              {
                backgroundColor: colors.background.elevated,
                borderColor: colors.border.subtle,
                borderRadius: radii.pill,
                paddingVertical: 4,
                paddingHorizontal: spacing.sm,
                marginBottom: spacing.xs,
              },
            ]}
          >
            <AppIcon
              name="check-circle"
              size="xs"
              color="success"
              style={{ marginRight: 6 }}
            />
            <AppText
              variant="caption"
              weight="bold"
              color="secondary"
              style={styles.completeBadgeText}
            >
              WORKOUT COMPLETE
            </AppText>
          </View>

          <AppText variant="display" weight="bold" style={styles.workoutName}>
            {workout.name}
          </AppText>

          {dateDisplay ? (
            <AppText
              variant="secondary"
              color="tertiary"
              style={{ marginTop: 2 }}
            >
              {dateDisplay}
            </AppText>
          ) : null}
        </View>

        {/* Factual Metrics Summary Grid */}
        <WorkoutSummaryStats
          duration={durationDisplay}
          exerciseCount={exercises.length}
          completedSetsCount={completedSetsCount}
          totalVolumeKg={totalVolumeKg}
        />

        {/* Exercise Performance Breakdown */}
        <View style={styles.breakdownHeader}>
          <AppText variant="heading" weight="bold">
            Exercises
          </AppText>
          <AppText variant="caption" color="tertiary" weight="medium">
            {exercises.length} total
          </AppText>
        </View>

        {exercises.length === 0 ? (
          <View
            style={[
              styles.emptyExercisesCard,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.subtle,
                borderRadius: radii.medium,
                padding: spacing.xl,
              },
            ]}
          >
            <AppText variant="secondary" color="tertiary" align="center">
              No exercises recorded for this workout session.
            </AppText>
          </View>
        ) : (
          exercises.map((workoutExercise) => (
            <WorkoutSummaryExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Bottom Done Action */}
      <View
        style={[
          styles.bottomActionContainer,
          {
            backgroundColor: colors.background.primary,
            borderTopColor: colors.border.subtle,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <AppButton
          title="Done"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleDone}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  doneTextButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  titleSection: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  completeBadgeText: {
    letterSpacing: 0.6,
    fontSize: 11,
  },
  workoutName: {
    letterSpacing: -0.5,
    marginTop: 4,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyExercisesCard: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
});
