import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '@hooks/useTheme';
import { Spacing, Shadows } from '@theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = Spacing.md,
  borderRadius = 20,
  elevated = true,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={isDark ? 'dark' : 'light'}
        blurAmount={15}
        reducedTransparencyFallbackColor={colors.glassBackground}
      />
      <View
        style={[
          styles.content,
          {
            borderRadius,
            padding,
            backgroundColor: colors.glassBackground,
            borderColor: colors.glassBorder,
            ...(elevated ? Shadows.lg : {}),
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
    borderWidth: 1.5,
  },
});
