import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppText,
  AppIcon,
  AppInput,
  AppDivider,
  useTheme,
} from '@/design-system';
import { exerciseRepository, Exercise } from '@/data';

export interface ExercisePickerModalProps {
  visible: boolean;
  title?: string;
  onSelectExercise: (exercise: Exercise) => void;
  onClose: () => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  visible,
  title = 'Select Exercise',
  onSelectExercise,
  onClose,
}) => {
  const { colors, spacing } = useTheme();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadExercises = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const list = await exerciseRepository.getExercises({
        search: query.trim() || undefined,
      });
      setExercises(list);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      loadExercises('');
    }
  }, [visible, loadExercises]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    loadExercises(text);
  };

  const formatTag = (str: string) => {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background.primary },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing.md,
              paddingTop: spacing.sm,
              paddingBottom: spacing.sm,
              borderBottomColor: colors.border.subtle,
              borderBottomWidth: 1,
            },
          ]}
        >
          <View style={styles.headerTitleRow}>
            <AppText variant="heading" weight="semibold">
              {title}
            </AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close exercise picker"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <AppIcon name="x" size="md" color="primary" />
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={{ marginTop: spacing.sm }}>
            <AppInput
              placeholder="Search exercise..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              leftIcon="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Exercise List */}
        {isLoading ? (
          <View style={[styles.centerContainer, { padding: spacing.xl }]}>
            <ActivityIndicator size="small" color={colors.text.tertiary} />
          </View>
        ) : exercises.length === 0 ? (
          <View style={[styles.centerContainer, { padding: spacing.xxl }]}>
            <AppText variant="body" color="secondary" align="center">
              No exercises found
            </AppText>
            <AppText
              variant="caption"
              color="tertiary"
              align="center"
              style={{ marginTop: spacing.xs }}
            >
              Try a different search term
            </AppText>
          </View>
        ) : (
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <AppDivider variant="subtle" />}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelectExercise(item);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item.name}`}
                style={({ pressed }) => [
                  styles.exerciseRow,
                  {
                    minHeight: 56,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: pressed
                      ? colors.action.secondary.pressed
                      : 'transparent',
                  },
                ]}
              >
                <View style={styles.exerciseInfo}>
                  <AppText variant="body" weight="medium">
                    {item.name}
                  </AppText>
                  <View style={styles.tagsRow}>
                    <AppText
                      variant="caption"
                      color="secondary"
                      style={{ textTransform: 'capitalize' }}
                    >
                      {formatTag(item.primaryMuscle)}
                    </AppText>
                    <AppText variant="caption" color="tertiary">
                      {' • '}
                    </AppText>
                    <AppText
                      variant="caption"
                      color="tertiary"
                      style={{ textTransform: 'capitalize' }}
                    >
                      {formatTag(item.equipment)}
                    </AppText>
                  </View>
                </View>
                <AppIcon name="plus" size="sm" color="tertiary" />
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
    paddingRight: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});
