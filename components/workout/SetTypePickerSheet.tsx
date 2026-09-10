import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppSheet, AppText, AppIcon, useTheme } from '@/design-system';
import { SetType } from '@/data';

export interface SetTypePickerSheetProps {
  visible: boolean;
  currentType: SetType;
  onSelect: (type: SetType) => void;
  onClose: () => void;
}

interface SetTypeOption {
  type: SetType;
  label: string;
  badge: string;
  description: string;
}

const SET_TYPES: SetTypeOption[] = [
  {
    type: 'working',
    label: 'Working Set',
    badge: '1',
    description: 'Standard targeted workout set',
  },
  {
    type: 'warmup',
    label: 'Warm-up Set',
    badge: 'W',
    description: 'Lighter set to prepare muscles & joints',
  },
  {
    type: 'drop',
    label: 'Drop Set',
    badge: 'D',
    description: 'Immediate reduction in weight with no rest',
  },
  {
    type: 'failure',
    label: 'Failure Set',
    badge: 'F',
    description: 'Set performed to momentary muscular failure',
  },
];

export const SetTypePickerSheet: React.FC<SetTypePickerSheetProps> = ({
  visible,
  currentType,
  onSelect,
  onClose,
}) => {
  const { colors, spacing, radii, layout } = useTheme();

  return (
    <AppSheet visible={visible} onClose={onClose} title="Select Set Type">
      <View style={{ paddingBottom: spacing.lg }}>
        {SET_TYPES.map((option) => {
          const isSelected = option.type === currentType;
          return (
            <Pressable
              key={option.type}
              onPress={() => {
                onSelect(option.type);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              style={({ pressed }) => [
                styles.optionRow,
                {
                  minHeight: layout.minTouchTarget + 8,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radii.medium,
                  backgroundColor: pressed
                    ? colors.action.secondary.pressed
                    : isSelected
                    ? colors.background.elevated
                    : 'transparent',
                },
              ]}
            >
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected
                      ? colors.action.primary.background
                      : colors.action.secondary.background,
                    borderRadius: radii.small,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  color={isSelected ? 'inverse' : 'secondary'}
                >
                  {option.badge}
                </AppText>
              </View>

              <View style={styles.textContainer}>
                <AppText
                  variant="body"
                  weight={isSelected ? 'semibold' : 'medium'}
                  color={isSelected ? 'primary' : 'secondary'}
                >
                  {option.label}
                </AppText>
                <AppText variant="caption" color="tertiary">
                  {option.description}
                </AppText>
              </View>

              {isSelected && (
                <AppIcon name="check" size="sm" color="primary" />
              )}
            </Pressable>
          );
        })}
      </View>
    </AppSheet>
  );
};

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
});
