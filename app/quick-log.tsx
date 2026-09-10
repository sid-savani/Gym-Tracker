import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, AppHeader, AppText, AppButton, useTheme } from '@/design-system';

export default function QuickLogPlaceholderScreen() {
  const router = useRouter();
  const { spacing } = useTheme();

  return (
    <Screen withPadding>
      <AppHeader
        title="Quick Log"
        leftIcon="arrow-left"
        onLeftPress={() => router.back()}
        leftAccessibilityLabel="Back"
      />

      <View style={[styles.content, { paddingVertical: spacing.xxl }]}>
        <AppText variant="title" weight="bold" align="center">
          Log One Exercise
        </AppText>
        <AppText
          variant="secondary"
          color="secondary"
          align="center"
          style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}
        >
          Quick single-exercise logger will be connected when the exercise library is established.
        </AppText>

        <AppButton
          title="Back to Start"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
