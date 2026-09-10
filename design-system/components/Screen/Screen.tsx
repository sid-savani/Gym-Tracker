import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  ScrollViewProps,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';

export interface ScreenProps {
  children?: ReactNode;
  scrollable?: boolean;
  withPadding?: boolean;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  keyboardAvoiding?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollViewProps?: Omit<ScrollViewProps, 'style' | 'contentContainerStyle'>;
  backgroundColor?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  withPadding = true,
  safeAreaEdges = ['top', 'bottom', 'left', 'right'],
  keyboardAvoiding = Platform.OS === 'ios',
  style,
  contentContainerStyle,
  scrollViewProps,
  backgroundColor,
}) => {
  const { colors, layout, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const resolvedBg = backgroundColor || colors.background.primary;

  const paddingHorizontal = withPadding ? layout.screenHorizontalPadding : 0;

  const insetPadding: ViewStyle = {
    paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
    paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: safeAreaEdges.includes('left') ? insets.left : 0,
    paddingRight: safeAreaEdges.includes('right') ? insets.right : 0,
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: resolvedBg,
  };

  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        {
          paddingHorizontal,
          flexGrow: 1,
        },
        contentContainerStyle,
      ]}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        {
          flex: 1,
          paddingHorizontal,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <View style={[containerStyle, insetPadding]}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={resolvedBg} />
      {wrappedContent}
    </View>
  );
};
