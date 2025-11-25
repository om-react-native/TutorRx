import { StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Shadows } from './shadows';
import type { ColorScheme } from './colors';

export const getGlassmorphismStyle = (colorScheme: ColorScheme = 'light') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    glassContainer: {
      backgroundColor: colors.glassBackground,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 16,
      ...Shadows.md,
    },
    glassCard: {
      backgroundColor: colors.glassBackground,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 20,
      padding: 16,
      ...Shadows.lg,
    },
    glassButton: {
      backgroundColor: colors.glassBackground,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 12,
      ...Shadows.sm,
    },
    glassInput: {
      backgroundColor: colors.glassBackground,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 12,
      ...Shadows.sm,
    },
  });
};

