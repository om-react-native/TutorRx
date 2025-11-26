import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@hooks/useTheme';
import { Typography, Spacing } from '@theme';
import { GradientBackground } from '../GradientBackground';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  text,
  fullScreen = false,
}) => {
  const { colors, isDark } = useTheme();

  if (fullScreen) {
    return (
      <GradientBackground>
        <View style={styles.fullScreenContainer}>
          <View style={[styles.loadingCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
            <ActivityIndicator
              size={size}
              color={color || colors.primary}
            />
            {text && (
              <Text
                style={[
                  styles.text,
                  {
                    color: colors.text,
                    fontFamily: Typography.fontFamily.regular,
                  },
                ]}
              >
                {text}
              </Text>
            )}
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size}
        color={color || colors.primary}
      />
      {text && (
        <Text
          style={[
            styles.text,
            {
              color: colors.textSecondary,
              fontFamily: Typography.fontFamily.regular,
            },
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingCard: {
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    fontWeight: '500',
  },
});

