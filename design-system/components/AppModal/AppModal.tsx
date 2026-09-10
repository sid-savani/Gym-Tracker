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
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../AppText/AppText';
import { AppButton } from '../AppButton/AppButton';

export interface AppModalAction {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  loading?: boolean;
}

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  primaryAction?: AppModalAction;
  secondaryAction?: AppModalAction;
  style?: ViewStyle;
}

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  style,
}) => {
  const { colors, radii, spacing, shadows } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable
          style={styles.dismissArea}
          onPress={onClose}
          accessibilityLabel="Dismiss dialog"
        />

        <View
          style={[
            styles.dialogContainer,
            shadows.modal,
            {
              backgroundColor: colors.background.surface,
              borderRadius: radii.large,
              padding: spacing.xl,
              borderWidth: 1,
              borderColor: colors.border.subtle,
            },
            style,
          ]}
        >
          {title && (
            <AppText
              variant="heading"
              weight="bold"
              align="center"
              style={{ marginBottom: description ? spacing.xs : spacing.md }}
            >
              {title}
            </AppText>
          )}

          {description && (
            <AppText
              variant="body"
              color="secondary"
              align="center"
              style={{ marginBottom: spacing.lg }}
            >
              {description}
            </AppText>
          )}

          {children}

          {(primaryAction || secondaryAction) && (
            <View
              style={[
                styles.actionsContainer,
                { marginTop: spacing.lg, gap: spacing.sm },
              ]}
            >
              {primaryAction && (
                <AppButton
                  title={primaryAction.title}
                  variant={primaryAction.variant || 'primary'}
                  onPress={primaryAction.onPress}
                  loading={primaryAction.loading}
                  fullWidth
                />
              )}
              {secondaryAction && (
                <AppButton
                  title={secondaryAction.title}
                  variant={secondaryAction.variant || 'secondary'}
                  onPress={secondaryAction.onPress}
                  loading={secondaryAction.loading}
                  fullWidth
                />
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 360,
  },
  actionsContainer: {
    width: '100%',
  },
});
