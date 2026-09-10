import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Screen,
  AppText,
  AppButton,
  AppIcon,
  AppSheet,
  AppInput,
  useTheme,
} from '@/design-system';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import {
  WorkoutExerciseCard,
  ExercisePickerModal,
  RestTimer,
} from '@/components/workout';
import { Exercise } from '@/data';
import { addNotificationResponseListener } from '@/services/notifications';

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radii, layout } = useTheme();

  const {
    workoutSession,
    isLoading,
    error,
    elapsedDisplay,
    previousPerformance,
    restTimer,
    updateWorkoutName,
    updateSetValues,
    toggleSetCompletion,
    changeSetType,
    addSet,
    deleteSet,
    addExercise,
    removeExercise,
    replaceExercise,
    moveExercise,
    finishWorkout,
    discardWorkout,
    startManualRest,
  } = useActiveWorkout(id);

  // Listen for rest complete notification taps to route back/stay in workout
  useEffect(() => {
    const unsubscribe = addNotificationResponseListener((targetWorkoutId) => {
      if (targetWorkoutId && targetWorkoutId !== id) {
        router.replace(`/workout/${targetWorkoutId}`);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [id, router]);

  // Sheets and Modals state
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [replaceTargetExerciseId, setReplaceTargetExerciseId] = useState<
    string | null
  >(null);

  const [isFinishSheetVisible, setIsFinishSheetVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const [isRenameSheetVisible, setIsRenameSheetVisible] = useState(false);
  const [editNameText, setEditNameText] = useState('');

  const exercises = workoutSession?.exercises || [];

  // Handlers
  const handleOpenAddExercise = () => {
    setReplaceTargetExerciseId(null);
    setIsPickerVisible(true);
  };

  const handleOpenReplaceExercise = (workoutExerciseId: string) => {
    setReplaceTargetExerciseId(workoutExerciseId);
    setIsPickerVisible(true);
  };

  const handleSelectExercise = async (selected: Exercise) => {
    try {
      if (replaceTargetExerciseId) {
        await replaceExercise(replaceTargetExerciseId, selected.id);
      } else {
        await addExercise(selected.id);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update exercise.');
    } finally {
      setReplaceTargetExerciseId(null);
    }
  };

  const handleConfirmFinishWorkout = async () => {
    try {
      setIsFinishing(true);
      await finishWorkout();
      setIsFinishSheetVisible(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      alert(err?.message || 'Failed to finish workout.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleConfirmDiscardWorkout = async () => {
    try {
      setIsFinishing(true);
      await discardWorkout();
      setIsFinishSheetVisible(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      alert(err?.message || 'Failed to discard workout.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSaveName = async () => {
    const trimmed = editNameText.trim();
    if (trimmed) {
      await updateWorkoutName(trimmed);
    }
    setIsRenameSheetVisible(false);
  };

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
            Loading session...
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error || !workoutSession) {
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
            The requested workout session could not be recovered.
          </AppText>
          <AppButton
            title="Return to Start"
            variant="secondary"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} withPadding={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.screenHorizontalPadding,
          paddingBottom: restTimer.isIdle ? spacing.xxl : 100,
          flexGrow: 1,
        }}
      >
        {/* 1. Header Bar */}
        <View
          style={[
            styles.headerBar,
            {
              paddingVertical: spacing.sm,
              marginBottom: spacing.md,
              borderBottomColor: colors.border.subtle,
              borderBottomWidth: 1,
            },
          ]}
        >
          {/* Back navigation */}
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => [
              styles.headerIconButton,
              {
                minHeight: layout.minTouchTarget,
                minWidth: layout.minTouchTarget,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <AppIcon name="chevron-left" size="md" color="primary" />
          </Pressable>

          {/* Workout Title & Live Timer */}
          <Pressable
            onPress={() => {
              setEditNameText(workoutSession.name);
              setIsRenameSheetVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Workout: ${workoutSession.name}. Tap to rename.`}
            style={styles.headerTitleContainer}
          >
            <View style={styles.titleRow}>
              <AppText
                variant="heading"
                weight="bold"
                align="center"
                numberOfLines={1}
                style={{ maxWidth: 160 }}
              >
                {workoutSession.name}
              </AppText>
              <AppIcon
                name="edit-2"
                size="xs"
                color="tertiary"
                style={{ marginLeft: 6 }}
              />
            </View>
            <AppText
              variant="caption"
              weight="semibold"
              color="secondary"
              align="center"
              style={{ fontVariant: ['tabular-nums'], marginTop: 1 }}
            >
              {elapsedDisplay}
            </AppText>
          </Pressable>

          {/* Header Right Actions */}
          <View style={styles.headerRightActions}>
            {/* Manual Rest Trigger when Idle */}
            {restTimer.isIdle && (
              <Pressable
                onPress={() => startManualRest(90)}
                accessibilityRole="button"
                accessibilityLabel="Start Rest Timer for 90 seconds"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={({ pressed }) => [
                  styles.manualRestButton,
                  {
                    backgroundColor: colors.background.elevated,
                    borderColor: colors.border.subtle,
                    borderWidth: 1,
                    borderRadius: radii.small,
                    paddingHorizontal: spacing.sm,
                    minHeight: 34,
                    marginRight: spacing.xs,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <AppIcon
                  name="clock"
                  size="xs"
                  color="secondary"
                  style={{ marginRight: 4 }}
                />
                <AppText variant="caption" weight="bold" color="secondary">
                  Rest
                </AppText>
              </Pressable>
            )}

            {/* Finish Action Button */}
            <Pressable
              onPress={() => setIsFinishSheetVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Finish Workout"
              style={({ pressed }) => [
                styles.finishButton,
                {
                  backgroundColor: colors.action.primary.background,
                  borderRadius: radii.small,
                  minHeight: 34,
                  paddingHorizontal: spacing.md,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <AppText variant="secondary" weight="bold" color="inverse">
                Finish
              </AppText>
            </Pressable>
          </View>
        </View>

      {/* 2. Workout Content */}
      {exercises.length === 0 ? (
        <View style={[styles.emptyContent, { paddingVertical: spacing.xxl }]}>
          <View
            style={[
              styles.emptyIconCircle,
              {
                backgroundColor: colors.background.elevated,
                borderRadius: 28,
                width: 56,
                height: 56,
                marginBottom: spacing.md,
              },
            ]}
          >
            <AppIcon name="activity" size="lg" color="tertiary" />
          </View>
          <AppText variant="heading" weight="bold" align="center">
            No Exercises Added
          </AppText>
          <AppText
            variant="secondary"
            color="secondary"
            align="center"
            style={{
              marginTop: spacing.xs,
              marginBottom: spacing.xl,
              maxWidth: 260,
            }}
          >
            Add exercises to start tracking your sets, weight, and repetitions.
          </AppText>
          <AppButton
            title="+ Add Exercise"
            variant="primary"
            size="md"
            onPress={handleOpenAddExercise}
          />
        </View>
      ) : (
        <View style={{ paddingBottom: spacing.xxl }}>
          {exercises.map((workoutExercise, index) => (
            <WorkoutExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
              previousPerformanceText={
                previousPerformance[workoutExercise.exerciseId]
              }
              canMoveUp={index > 0}
              canMoveDown={index < exercises.length - 1}
              onUpdateSetValues={updateSetValues}
              onToggleSetCompletion={toggleSetCompletion}
              onChangeSetType={changeSetType}
              onAddSet={addSet}
              onDeleteSet={deleteSet}
              onReplaceExercise={handleOpenReplaceExercise}
              onMoveExercise={moveExercise}
              onRemoveExercise={removeExercise}
            />
          ))}

          {/* + Add Exercise Primary Action */}
          <Pressable
            onPress={handleOpenAddExercise}
            accessibilityRole="button"
            accessibilityLabel="Add Exercise to workout"
            style={({ pressed }) => [
              styles.addExerciseCardButton,
              {
                minHeight: 52,
                borderRadius: radii.medium,
                borderColor: colors.border.default,
                borderWidth: 1,
                borderStyle: 'dashed',
                backgroundColor: pressed
                  ? colors.action.secondary.pressed
                  : 'transparent',
                marginTop: spacing.xs,
                marginBottom: spacing.xxl,
              },
            ]}
          >
            <AppIcon
              name="plus"
              size="sm"
              color="primary"
              style={{ marginRight: spacing.xs }}
            />
            <AppText variant="body" weight="semibold">
              Add Exercise
            </AppText>
          </Pressable>
        </View>
      )}

      </ScrollView>

      {/* Floating Rest Timer Bar */}
      {!restTimer.isIdle && (
        <View
          style={[
            styles.floatingTimerWrapper,
            {
              paddingHorizontal: layout.screenHorizontalPadding,
              paddingBottom: spacing.sm,
            },
          ]}
        >
          <RestTimer />
        </View>
      )}

      {/* 3. Exercise Picker Modal (Add / Replace) */}
      <ExercisePickerModal
        visible={isPickerVisible}
        title={
          replaceTargetExerciseId ? 'Replace Exercise' : 'Add Exercise'
        }
        onSelectExercise={handleSelectExercise}
        onClose={() => {
          setIsPickerVisible(false);
          setReplaceTargetExerciseId(null);
        }}
      />

      {/* 4. Rename Workout Sheet */}
      <AppSheet
        visible={isRenameSheetVisible}
        onClose={() => setIsRenameSheetVisible(false)}
        title="Rename Workout"
      >
        <View style={{ paddingBottom: spacing.lg }}>
          <AppInput
            value={editNameText}
            onChangeText={setEditNameText}
            placeholder="Workout name"
            autoFocus
            onSubmitEditing={handleSaveName}
            returnKeyType="done"
          />
          <View style={{ marginTop: spacing.md }}>
            <AppButton
              title="Save Name"
              variant="primary"
              onPress={handleSaveName}
              fullWidth
            />
          </View>
        </View>
      </AppSheet>

      {/* 5. Finish Workout Confirmation Sheet */}
      <AppSheet
        visible={isFinishSheetVisible}
        onClose={() => setIsFinishSheetVisible(false)}
        title="Workout Actions"
      >
        <View style={{ paddingBottom: spacing.lg }}>
          <AppText
            variant="secondary"
            color="secondary"
            style={{ marginBottom: spacing.lg }}
          >
            Time elapsed: {elapsedDisplay} • {exercises.length} exercise
            {exercises.length === 1 ? '' : 's'}
          </AppText>

          {/* Finish Button */}
          <AppButton
            title="Finish Workout"
            variant="primary"
            onPress={handleConfirmFinishWorkout}
            loading={isFinishing}
            fullWidth
            style={{ marginBottom: spacing.md }}
          />

          {/* Discard Button */}
          <AppButton
            title="Discard Workout"
            variant="destructive"
            onPress={handleConfirmDiscardWorkout}
            disabled={isFinishing}
            fullWidth
            style={{ marginBottom: spacing.md }}
          />

          {/* Cancel Button */}
          <AppButton
            title="Resume Workout"
            variant="secondary"
            onPress={() => setIsFinishSheetVisible(false)}
            disabled={isFinishing}
            fullWidth
          />
        </View>
      </AppSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manualRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addExerciseCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  floatingTimerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});

