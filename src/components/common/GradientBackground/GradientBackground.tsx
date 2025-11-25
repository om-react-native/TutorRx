import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@hooks/useTheme';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
}) => {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
