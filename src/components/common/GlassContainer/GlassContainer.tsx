import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '@hooks/useTheme';
import { Spacing } from '@theme/spacing';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurType?: 'light' | 'dark' | 'xlight' | 'dark';
  blurAmount?: number;
  borderRadius?: number;
  padding?: number;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  blurType,
  blurAmount = 10,
  borderRadius = 16,
  padding = Spacing.md,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={blurType || (isDark ? 'dark' : 'light')}
        blurAmount={blurAmount}
      />
      <View
        style={[
          styles.content,
          {
            borderRadius,
            padding,
            backgroundColor: colors.glassBackground,
            borderColor: colors.glassBorder,
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
  },
  content: {
    borderWidth: 1,
  },
});

