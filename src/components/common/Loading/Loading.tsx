import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@hooks/useTheme';
import { Typography, Spacing } from '@theme';

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
  const { colors } = useTheme();

  const containerStyle = fullScreen
    ? [styles.container, styles.fullScreen]
    : styles.container;

  return (
    <View style={containerStyle}>
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
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  text: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
});

