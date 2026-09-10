import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { SpacingToken } from '../../tokens/spacing';

export interface AppDividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'subtle';
  spacing?: SpacingToken;
  style?: ViewStyle;
}

export const AppDivider: React.FC<AppDividerProps> = ({
  orientation = 'horizontal',
  variant = 'default',
  spacing: spacingProp,
  style,
}) => {
  const { colors, spacing: spacingTokens, layout } = useTheme();

  const borderColor = variant === 'subtle' ? colors.border.subtle : colors.border.default;
  const marginValue = spacingProp ? spacingTokens[spacingProp] : 0;

  const isHorizontal = orientation === 'horizontal';

  const dividerStyle: ViewStyle = isHorizontal
    ? {
        height: layout.dividerThickness,
        backgroundColor: borderColor,
        width: '100%',
        marginVertical: marginValue,
      }
    : {
        width: layout.dividerThickness,
        backgroundColor: borderColor,
        height: '100%',
        marginHorizontal: marginValue,
      };

  return <View style={[dividerStyle, style]} />;
};
