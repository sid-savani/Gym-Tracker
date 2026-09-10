import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../AppText/AppText';
import { SpacingToken } from '../../tokens/spacing';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  card?: boolean;
  spacing?: SpacingToken;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  action,
  children,
  card = false,
  spacing: spacingProp = 'lg',
  style,
}) => {
  const { colors, spacing: spacingTokens, radii } = useTheme();

  const marginVertical = spacingTokens[spacingProp];

  return (
    <View style={[{ marginVertical }, style]}>
      {(title || subtitle || action) && (
        <View style={[styles.headerRow, { marginBottom: spacingTokens.sm }]}>
          <View style={styles.titleWrapper}>
            {title && (
              <AppText variant="heading" weight="semibold">
                {title}
              </AppText>
            )}
            {subtitle && (
              <AppText
                variant="caption"
                color="secondary"
                style={{ marginTop: 2 }}
              >
                {subtitle}
              </AppText>
            )}
          </View>
          {action && <View style={styles.actionWrapper}>{action}</View>}
        </View>
      )}

      <View
        style={[
          card && {
            backgroundColor: colors.background.surface,
            borderRadius: radii.medium,
            padding: spacingTokens.md,
            borderWidth: 1,
            borderColor: colors.border.subtle,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flex: 1,
  },
  actionWrapper: {
    marginLeft: 8,
  },
});
