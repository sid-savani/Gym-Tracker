import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { AppText, AppIcon, useTheme } from '@/design-system';
import { WorkoutSet, SetType, Exercise, UpdateSetInput } from '@/data';
import { SetTypePickerSheet } from './SetTypePickerSheet';

export interface SetRowProps {
  set: WorkoutSet;
  exercise: Exercise;
  onUpdateValues: (updates: Partial<UpdateSetInput>) => void;
  onToggleCompletion: () => void;
  onChangeType: (type: SetType) => void;
  onDeleteSet: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  exercise,
  onUpdateValues,
  onToggleCompletion,
  onChangeType,
  onDeleteSet,
}) => {
  const { colors, radii, layout, typography } = useTheme();
  const [isTypeSheetVisible, setIsTypeSheetVisible] = useState(false);

  const isCompleted = !!set.completedAt;

  // Local text states for smooth typing
  const [weightText, setWeightText] = useState(
    set.weight !== null && set.weight !== undefined ? String(set.weight) : ''
  );
  const [repsText, setRepsText] = useState(
    set.reps !== null && set.reps !== undefined ? String(set.reps) : ''
  );
  const [durationText, setDurationText] = useState(
    set.duration !== null && set.duration !== undefined ? String(set.duration) : ''
  );
  const [distanceText, setDistanceText] = useState(
    set.distance !== null && set.distance !== undefined ? String(set.distance) : ''
  );

  // Sync state if set values changed externally (e.g. next-set prefill)
  React.useEffect(() => {
    setWeightText(
      set.weight !== null && set.weight !== undefined ? String(set.weight) : ''
    );
  }, [set.weight]);

  React.useEffect(() => {
    setRepsText(
      set.reps !== null && set.reps !== undefined ? String(set.reps) : ''
    );
  }, [set.reps]);

  React.useEffect(() => {
    setDurationText(
      set.duration !== null && set.duration !== undefined ? String(set.duration) : ''
    );
  }, [set.duration]);

  React.useEffect(() => {
    setDistanceText(
      set.distance !== null && set.distance !== undefined ? String(set.distance) : ''
    );
  }, [set.distance]);

  const handleWeightBlur = () => {
    const trimmed = weightText.trim();
    const num = trimmed ? parseFloat(trimmed) : null;
    onUpdateValues({ weight: isNaN(num as number) ? null : num });
  };

  const handleRepsBlur = () => {
    const trimmed = repsText.trim();
    const num = trimmed ? parseInt(trimmed, 10) : null;
    onUpdateValues({ reps: isNaN(num as number) ? null : num });
  };

  const handleDurationBlur = () => {
    const trimmed = durationText.trim();
    const num = trimmed ? parseInt(trimmed, 10) : null;
    onUpdateValues({ duration: isNaN(num as number) ? null : num });
  };

  const handleDistanceBlur = () => {
    const trimmed = distanceText.trim();
    const num = trimmed ? parseFloat(trimmed) : null;
    onUpdateValues({ distance: isNaN(num as number) ? null : num });
  };

  // Badge label & styling based on set type
  const getBadgeLabel = () => {
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

  const getBadgeBgColor = () => {
    if (set.setType === 'warmup') {
      return colors.background.elevated;
    }
    if (set.setType === 'drop' || set.setType === 'failure') {
      return colors.background.elevated;
    }
    return colors.action.secondary.background;
  };

  const isDurationOnly =
    exercise.exerciseType === 'duration' ||
    (exercise.trackingMetrics?.includes('duration') &&
      !exercise.trackingMetrics?.includes('reps'));

  const isDistanceDuration = exercise.exerciseType === 'distance_duration';

  return (
    <View
      style={[
        styles.row,
        {
          minHeight: 48,
          paddingVertical: 4,
          backgroundColor: isCompleted
            ? colors.semantic.successSurface
            : 'transparent',
          borderRadius: radii.medium,
        },
      ]}
    >
      {/* 1. Set Badge (Tap to change type) */}
      <Pressable
        onPress={() => setIsTypeSheetVisible(true)}
        onLongPress={onDeleteSet}
        accessibilityRole="button"
        accessibilityLabel={`Set ${set.setNumber}, type ${set.setType}. Tap to change type, long press to delete.`}
        style={({ pressed }) => [
          styles.badgeButton,
          {
            minHeight: layout.minTouchTarget,
            minWidth: 36,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.badge,
            {
              backgroundColor: getBadgeBgColor(),
              borderRadius: radii.small,
            },
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            color={
              set.setType === 'warmup'
                ? 'tertiary'
                : set.setType === 'failure'
                ? 'destructive'
                : 'primary'
            }
          >
            {getBadgeLabel()}
          </AppText>
        </View>
      </Pressable>

      {/* 2. Inputs based on exercise tracking metrics */}
      <View style={styles.inputsContainer}>
        {!isDurationOnly && !isDistanceDuration && (
          <>
            {/* Weight Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.input.background,
                  borderColor: isCompleted
                    ? colors.border.subtle
                    : colors.border.default,
                  borderRadius: radii.small,
                },
              ]}
            >
              <TextInput
                value={weightText}
                onChangeText={(text) => {
                  setWeightText(text);
                  const num = text.trim() ? parseFloat(text.trim()) : null;
                  if (!isNaN(num as number) || text.trim() === '') {
                    onUpdateValues({ weight: isNaN(num as number) ? null : num });
                  }
                }}
                onBlur={handleWeightBlur}
                placeholder="—"
                placeholderTextColor={colors.input.placeholder}
                keyboardType="decimal-pad"
                returnKeyType="done"
                selectTextOnFocus
                style={[
                  styles.input,
                  typography.body,
                  {
                    color: colors.input.text,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              />
            </View>

            {/* Reps Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.input.background,
                  borderColor: isCompleted
                    ? colors.border.subtle
                    : colors.border.default,
                  borderRadius: radii.small,
                },
              ]}
            >
              <TextInput
                value={repsText}
                onChangeText={(text) => {
                  setRepsText(text);
                  const num = text.trim() ? parseInt(text.trim(), 10) : null;
                  if (!isNaN(num as number) || text.trim() === '') {
                    onUpdateValues({ reps: isNaN(num as number) ? null : num });
                  }
                }}
                onBlur={handleRepsBlur}
                placeholder="—"
                placeholderTextColor={colors.input.placeholder}
                keyboardType="number-pad"
                returnKeyType="done"
                selectTextOnFocus
                style={[
                  styles.input,
                  typography.body,
                  {
                    color: colors.input.text,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              />
            </View>
          </>
        )}

        {isDurationOnly && (
          <View
            style={[
              styles.inputWrapperWide,
              {
                backgroundColor: colors.input.background,
                borderColor: isCompleted
                  ? colors.border.subtle
                  : colors.border.default,
                borderRadius: radii.small,
              },
            ]}
          >
            <TextInput
              value={durationText}
              onChangeText={(text) => {
                setDurationText(text);
                const num = text.trim() ? parseInt(text.trim(), 10) : null;
                if (!isNaN(num as number) || text.trim() === '') {
                  onUpdateValues({ duration: isNaN(num as number) ? null : num });
                }
              }}
              onBlur={handleDurationBlur}
              placeholder="Secs"
              placeholderTextColor={colors.input.placeholder}
              keyboardType="number-pad"
              returnKeyType="done"
              selectTextOnFocus
              style={[
                styles.input,
                typography.body,
                {
                  color: colors.input.text,
                  fontVariant: ['tabular-nums'],
                },
              ]}
            />
          </View>
        )}

        {isDistanceDuration && (
          <>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.input.background,
                  borderColor: isCompleted
                    ? colors.border.subtle
                    : colors.border.default,
                  borderRadius: radii.small,
                },
              ]}
            >
              <TextInput
                value={distanceText}
                onChangeText={(text) => {
                  setDistanceText(text);
                  const num = text.trim() ? parseFloat(text.trim()) : null;
                  if (!isNaN(num as number) || text.trim() === '') {
                    onUpdateValues({ distance: isNaN(num as number) ? null : num });
                  }
                }}
                onBlur={handleDistanceBlur}
                placeholder="Meters"
                placeholderTextColor={colors.input.placeholder}
                keyboardType="decimal-pad"
                returnKeyType="done"
                selectTextOnFocus
                style={[
                  styles.input,
                  typography.body,
                  {
                    color: colors.input.text,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              />
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.input.background,
                  borderColor: isCompleted
                    ? colors.border.subtle
                    : colors.border.default,
                  borderRadius: radii.small,
                },
              ]}
            >
              <TextInput
                value={durationText}
                onChangeText={(text) => {
                  setDurationText(text);
                  const num = text.trim() ? parseInt(text.trim(), 10) : null;
                  if (!isNaN(num as number) || text.trim() === '') {
                    onUpdateValues({ duration: isNaN(num as number) ? null : num });
                  }
                }}
                onBlur={handleDurationBlur}
                placeholder="Secs"
                placeholderTextColor={colors.input.placeholder}
                keyboardType="number-pad"
                returnKeyType="done"
                selectTextOnFocus
                style={[
                  styles.input,
                  typography.body,
                  {
                    color: colors.input.text,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              />
            </View>
          </>
        )}
      </View>

      {/* 3. Complete Toggle Button */}
      <Pressable
        onPress={onToggleCompletion}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={`Mark set ${set.setNumber} as ${isCompleted ? 'incomplete' : 'complete'}`}
        style={({ pressed }) => [
          styles.checkButton,
          {
            minHeight: layout.minTouchTarget,
            minWidth: layout.minTouchTarget,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.checkCircle,
            {
              backgroundColor: isCompleted
                ? colors.semantic.success
                : colors.action.secondary.background,
              borderColor: isCompleted
                ? colors.semantic.success
                : colors.border.default,
            },
          ]}
        >
          {isCompleted ? (
            <AppIcon name="check" size="xs" color="inverse" />
          ) : (
            <View style={styles.checkCircleEmpty} />
          )}
        </View>
      </Pressable>

      {/* Set Type Sheet */}
      <SetTypePickerSheet
        visible={isTypeSheetVisible}
        currentType={set.setType}
        onSelect={onChangeType}
        onClose={() => setIsTypeSheetVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  badgeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  inputWrapperWide: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    maxWidth: 160,
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    padding: 0,
    fontWeight: '600',
  },
  checkButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleEmpty: {
    width: 8,
    height: 8,
  },
});
