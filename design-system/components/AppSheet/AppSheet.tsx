import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../AppText/AppText';
import { AppIcon } from '../../icons/AppIcon';

export interface AppSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  style?: ViewStyle;
}

export const AppSheet: React.FC<AppSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  style,
}) => {
  const { colors, radii, spacing, layout, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        {/* Backdrop Pressable */}
        <Pressable
          style={styles.dismissArea}
          onPress={onClose}
          accessibilityLabel="Dismiss sheet"
        />

        {/* Sheet Content */}
        <View
          style={[
            styles.sheetContainer,
            shadows.modal,
            {
              backgroundColor: colors.background.surface,
              borderTopLeftRadius: radii.large,
              borderTopRightRadius: radii.large,
              paddingBottom: Math.max(insets.bottom, spacing.md),
              paddingHorizontal: spacing.lg,
            },
            style,
          ]}
        >
          {/* Grab Handle */}
          <View style={styles.handleWrapper}>
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: colors.border.default,
                  width: layout.bottomSheetHandleWidth,
                  height: layout.bottomSheetHandleHeight,
                  borderRadius: radii.pill,
                },
              ]}
            />
          </View>

          {/* Header Row */}
          {(title || showCloseButton) && (
            <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
              <View style={styles.titleWrapper}>
                {title && (
                  <AppText variant="title" weight="semibold">
                    {title}
                  </AppText>
                )}
              </View>

              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Close sheet"
                  style={({ pressed }) => [
                    styles.closeButton,
                    {
                      opacity: pressed ? 0.6 : 1,
                      minHeight: layout.minTouchTarget,
                      minWidth: layout.minTouchTarget,
                    },
                  ]}
                >
                  <AppIcon name="x" size="sm" color="secondary" />
                </Pressable>
              )}
            </View>
          )}

          {/* Children Content */}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  handleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flex: 1,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
