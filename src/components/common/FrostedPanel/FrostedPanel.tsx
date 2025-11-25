import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '@hooks/useTheme';

interface FrostedPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurAmount?: number;
  borderRadius?: number;
  padding?: number;
}

export const FrostedPanel: React.FC<FrostedPanelProps> = ({
  children,
  style,
  blurAmount = 40,
  borderRadius = 0,
  padding = 32,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={isDark ? 'dark' : 'light'}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={colors.glassPanelBackground}
      />
      <View
        style={[
          styles.content,
          {
            borderRadius,
            padding,
            backgroundColor: colors.glassPanelBackground,
            // borderColor: colors.glassBorder,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    // borderWidth: 1.5,
    width: '100%',
  },
});
