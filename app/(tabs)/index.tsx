import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  AppText,
  AppButton,
  AppIcon,
  AppDivider,
  AppSheet,
  AppInput,
  useTheme,
} from '@/design-system';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { Routine } from '@/data';

export default function StartWorkoutScreen() {
  const router = useRouter();
  const { colors, spacing, radii, layout } = useTheme();

  const {
    routines,
    activeWorkout,
    isLoading,
    isCreatingRoutine,
    error,
    isRecoveryDismissed,
    dismissRecovery,
    createRoutine,
    startRoutineWorkout,
    startEmptyWorkout,
    formatElapsedTime,
  } = useStartWorkout();

  // Create routine sheet state
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [createError, setCreateError] = useState<string | undefined>(undefined);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);

  const handleStartRoutine = async (routine: Routine) => {
    try {
      setIsStartingWorkout(true);
      const session = await startRoutineWorkout(routine.id);
      router.push({
        pathname: '/workout/[id]',
        params: { id: session.id },
      });
    } catch (err: any) {
      alert(err?.message || 'Failed to start workout.');
    } finally {
      setIsStartingWorkout(false);
    }
  };

  const handleStartEmpty = async () => {
    try {
      setIsStartingWorkout(true);
      const session = await startEmptyWorkout();
      router.push({
        pathname: '/workout/[id]',
        params: { id: session.id },
      });
    } catch (err: any) {
      alert(err?.message || 'Failed to start empty workout.');
    } finally {
      setIsStartingWorkout(false);
    }
  };

  const handleContinueActiveWorkout = () => {
    if (activeWorkout) {
      router.push({
        pathname: '/workout/[id]',
        params: { id: activeWorkout.id },
      });
    }
  };

  const handleCreateRoutineSubmit = async () => {
    const trimmed = newRoutineName.trim();
    if (!trimmed) {
      setCreateError('Please enter a routine name.');
      return;
    }

    try {
      setCreateError(undefined);
      await createRoutine(trimmed);
      setNewRoutineName('');
      setIsCreateSheetOpen(false);
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create routine.');
    }
  };

  return (
    <Screen scrollable withPadding>
      {/* Header */}
      <View style={[styles.headerContainer, { marginTop: spacing.md, marginBottom: spacing.xl }]}>
        <AppText variant="display" weight="bold">
          Start Workout
        </AppText>
      </View>

      {/* Active Workout Recovery Banner */}
      {activeWorkout && !isRecoveryDismissed && (
        <View
          style={[
            styles.recoveryBanner,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.default,
              borderRadius: radii.medium,
              padding: spacing.md,
              marginBottom: spacing.xxl,
            },
          ]}
        >
          <View style={styles.recoveryHeaderRow}>
            <View style={styles.recoveryTagWrapper}>
              <View
                style={[
                  styles.recoveryStatusDot,
                  { backgroundColor: colors.semantic.success },
                ]}
              />
              <AppText
                variant="caption"
                weight="bold"
                color="secondary"
                style={{ letterSpacing: 0.5 }}
              >
                IN PROGRESS
              </AppText>
            </View>

            <Pressable
              onPress={dismissRecovery}
              accessibilityRole="button"
              accessibilityLabel="Dismiss recovery notice"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.dismissButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <AppIcon name="x" size="xs" color="tertiary" />
            </Pressable>
          </View>

          <AppText
            variant="heading"
            weight="bold"
            style={{ marginTop: spacing.xs }}
          >
            {activeWorkout.name}
          </AppText>

          <AppText
            variant="secondary"
            color="secondary"
            style={{ marginTop: 2, marginBottom: spacing.md }}
          >
            {formatElapsedTime(activeWorkout.startedAt)}
          </AppText>

          <AppButton
            title="Continue Workout"
            variant="primary"
            size="md"
            icon="play"
            onPress={handleContinueActiveWorkout}
            fullWidth
          />
        </View>
      )}

      {/* Error state */}
      {error && (
        <View
          style={[
            styles.errorContainer,
            {
              backgroundColor: colors.semantic.destructiveSurface,
              borderColor: colors.semantic.destructive,
              borderRadius: radii.medium,
              padding: spacing.md,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <AppText variant="secondary" color="destructive">
            {error}
          </AppText>
        </View>
      )}

      {/* Section 1: Routines */}
      <View style={[styles.sectionContainer, { marginBottom: spacing.xxl }]}>
        <View style={[styles.sectionHeaderRow, { marginBottom: spacing.sm }]}>
          <AppText variant="heading" weight="semibold">
            Routines
          </AppText>
        </View>

        {isLoading ? (
          <View style={[styles.loadingContainer, { paddingVertical: spacing.lg }]}>
            <ActivityIndicator size="small" color={colors.text.tertiary} />
          </View>
        ) : routines.length === 0 ? (
          <View style={[styles.emptyRoutinesContainer, { paddingVertical: spacing.md }]}>
            <AppText variant="body" color="secondary" weight="medium">
              No routines yet
            </AppText>
            <AppText
              variant="caption"
              color="tertiary"
              style={{ marginTop: spacing.xxs }}
            >
              Create a routine or start an empty workout.
            </AppText>
          </View>
        ) : (
          <View
            style={[
              styles.routinesList,
              {
                backgroundColor: colors.background.surface,
                borderRadius: radii.medium,
                borderColor: colors.border.subtle,
                borderWidth: 1,
              },
            ]}
          >
            {routines.map((routine, index) => (
              <React.Fragment key={routine.id}>
                {index > 0 && <AppDivider variant="subtle" />}
                <Pressable
                  onPress={() => handleStartRoutine(routine)}
                  disabled={isStartingWorkout}
                  accessibilityRole="button"
                  accessibilityLabel={`Start routine ${routine.name}`}
                  style={({ pressed }) => [
                    styles.routineRow,
                    {
                      minHeight: 56,
                      paddingHorizontal: spacing.md,
                      backgroundColor: pressed
                        ? colors.action.secondary.pressed
                        : 'transparent',
                    },
                  ]}
                >
                  <AppText variant="body" weight="medium" style={{ flex: 1 }}>
                    {routine.name}
                  </AppText>
                  <AppIcon name="chevron-right" size="sm" color="tertiary" />
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Create Routine Action */}
        <Pressable
          onPress={() => {
            setNewRoutineName('');
            setCreateError(undefined);
            setIsCreateSheetOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Create Routine"
          style={({ pressed }) => [
            styles.createRoutineRow,
            {
              marginTop: spacing.md,
              minHeight: layout.minTouchTarget,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <AppIcon name="plus" size="sm" color="primary" style={{ marginRight: spacing.xs }} />
          <AppText variant="body" weight="semibold">
            Create Routine
          </AppText>
        </Pressable>
      </View>

      {/* Section 2: Quick Start */}
      <View style={[styles.sectionContainer, { marginBottom: spacing.xxl }]}>
        <View style={[styles.sectionHeaderRow, { marginBottom: spacing.sm }]}>
          <AppText variant="heading" weight="semibold">
            Quick Start
          </AppText>
        </View>

        <Pressable
          onPress={handleStartEmpty}
          disabled={isStartingWorkout}
          accessibilityRole="button"
          accessibilityLabel="Start Empty Workout"
          style={({ pressed }) => [
            styles.actionCardRow,
            {
              minHeight: 56,
              paddingHorizontal: spacing.md,
              backgroundColor: colors.background.surface,
              borderRadius: radii.medium,
              borderColor: colors.border.subtle,
              borderWidth: 1,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={styles.actionCardContent}>
            <AppIcon
              name="play"
              size="sm"
              color="primary"
              style={{ marginRight: spacing.md }}
            />
            <AppText variant="body" weight="medium">
              Start Empty Workout
            </AppText>
          </View>
          <AppIcon name="chevron-right" size="sm" color="tertiary" />
        </Pressable>
      </View>

      {/* Section 3: Quick Log */}
      <View style={[styles.sectionContainer, { marginBottom: spacing.xxxl }]}>
        <View style={[styles.sectionHeaderRow, { marginBottom: spacing.sm }]}>
          <AppText variant="heading" weight="semibold">
            Quick Log
          </AppText>
        </View>

        <Pressable
          onPress={() => router.push('/quick-log')}
          accessibilityRole="button"
          accessibilityLabel="Log one exercise"
          style={({ pressed }) => [
            styles.actionCardRow,
            {
              minHeight: 56,
              paddingHorizontal: spacing.md,
              backgroundColor: colors.background.surface,
              borderRadius: radii.medium,
              borderColor: colors.border.subtle,
              borderWidth: 1,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={styles.actionCardContent}>
            <AppIcon
              name="edit-3"
              size="sm"
              color="secondary"
              style={{ marginRight: spacing.md }}
            />
            <AppText variant="body" weight="medium">
              Log one exercise
            </AppText>
          </View>
          <AppIcon name="chevron-right" size="sm" color="tertiary" />
        </Pressable>
      </View>

      {/* Create Routine Sheet Modal */}
      <AppSheet
        visible={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        title="New Routine"
      >
        <View style={{ paddingTop: spacing.xs, paddingBottom: spacing.lg }}>
          <AppInput
            placeholder="Routine name (e.g. Push Day)"
            value={newRoutineName}
            onChangeText={(text) => {
              setNewRoutineName(text);
              if (createError) setCreateError(undefined);
            }}
            error={createError}
            disabled={isCreatingRoutine}
            autoFocus
            onSubmitEditing={handleCreateRoutineSubmit}
            returnKeyType="done"
          />

          <View style={{ marginTop: spacing.lg }}>
            <AppButton
              title="Create Routine"
              variant="primary"
              onPress={handleCreateRoutineSubmit}
              loading={isCreatingRoutine}
              disabled={!newRoutineName.trim() || isCreatingRoutine}
              fullWidth
            />
          </View>
        </View>
      </AppSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
  },
  recoveryBanner: {
    borderWidth: 1,
  },
  recoveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recoveryTagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recoveryStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dismissButton: {
    padding: 4,
  },
  errorContainer: {
    borderWidth: 1,
  },
  sectionContainer: {
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRoutinesContainer: {
    width: '100%',
  },
  routinesList: {
    overflow: 'hidden',
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createRoutineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
