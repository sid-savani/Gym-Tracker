import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppSheet, AppText, AppIcon, AppDivider, useTheme } from '@/design-system';

export interface ExerciseActionSheetProps {
  visible: boolean;
  exerciseName: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onReplace: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export const ExerciseActionSheet: React.FC<ExerciseActionSheetProps> = ({
  visible,
  exerciseName,
  canMoveUp,
  canMoveDown,
  onReplace,
  onMoveUp,
  onMoveDown,
  onRemove,
  onClose,
}) => {
  const { colors, spacing, radii, layout } = useTheme();

  return (
    <AppSheet visible={visible} onClose={onClose} title={exerciseName}>
      <View style={{ paddingBottom: spacing.lg }}>
        {/* Replace Exercise */}
        <Pressable
          onPress={() => {
            onClose();
            onReplace();
          }}
          accessibilityRole="button"
          accessibilityLabel="Replace Exercise"
          style={({ pressed }) => [
            styles.actionRow,
            {
              minHeight: layout.minTouchTarget,
              paddingHorizontal: spacing.md,
              borderRadius: radii.medium,
              backgroundColor: pressed
                ? colors.action.secondary.pressed
                : 'transparent',
            },
          ]}
        >
          <AppIcon name="repeat" size="sm" color="primary" style={{ marginRight: spacing.md }} />
          <AppText variant="body" weight="medium">
            Replace Exercise
          </AppText>
        </Pressable>

        {/* Move Up */}
        {canMoveUp && (
          <Pressable
            onPress={() => {
              onClose();
              onMoveUp();
            }}
            accessibilityRole="button"
            accessibilityLabel="Move Exercise Up"
            style={({ pressed }) => [
              styles.actionRow,
              {
                minHeight: layout.minTouchTarget,
                paddingHorizontal: spacing.md,
                borderRadius: radii.medium,
                backgroundColor: pressed
                  ? colors.action.secondary.pressed
                  : 'transparent',
              },
            ]}
          >
            <AppIcon name="arrow-up" size="sm" color="primary" style={{ marginRight: spacing.md }} />
            <AppText variant="body" weight="medium">
              Move Up
            </AppText>
          </Pressable>
        )}

        {/* Move Down */}
        {canMoveDown && (
          <Pressable
            onPress={() => {
              onClose();
              onMoveDown();
            }}
            accessibilityRole="button"
            accessibilityLabel="Move Exercise Down"
            style={({ pressed }) => [
              styles.actionRow,
              {
                minHeight: layout.minTouchTarget,
                paddingHorizontal: spacing.md,
                borderRadius: radii.medium,
                backgroundColor: pressed
                  ? colors.action.secondary.pressed
                  : 'transparent',
              },
            ]}
          >
            <AppIcon name="arrow-down" size="sm" color="primary" style={{ marginRight: spacing.md }} />
            <AppText variant="body" weight="medium">
              Move Down
            </AppText>
          </Pressable>
        )}

        <View style={{ marginVertical: spacing.xs }}>
          <AppDivider variant="subtle" />
        </View>

        {/* Remove Exercise */}
        <Pressable
          onPress={() => {
            onClose();
            onRemove();
          }}
          accessibilityRole="button"
          accessibilityLabel="Remove Exercise from Workout"
          style={({ pressed }) => [
            styles.actionRow,
            {
              minHeight: layout.minTouchTarget,
              paddingHorizontal: spacing.md,
              borderRadius: radii.medium,
              backgroundColor: pressed
                ? colors.semantic.destructiveSurface
                : 'transparent',
            },
          ]}
        >
          <AppIcon
            name="trash-2"
            size="sm"
            color="destructive"
            style={{ marginRight: spacing.md }}
          />
          <AppText variant="body" weight="medium" color="destructive">
            Remove Exercise
          </AppText>
        </Pressable>
      </View>
    </AppSheet>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
