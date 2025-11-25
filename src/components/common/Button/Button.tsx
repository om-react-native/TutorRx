import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '@hooks/useTheme';
import { Typography, Spacing } from '@theme';
import type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const { colors, isDark } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 24,
      opacity: disabled ? 0.5 : 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: variant === 'primary' ? 0.25 : 0.08,
      shadowRadius: 8,
      elevation: variant === 'primary' ? 5 : 2,
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
      md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
      lg: {
        paddingVertical: Spacing.md + 4,
        paddingHorizontal: Spacing.xl,
        minHeight: 56,
      },
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: colors.glassBackground,
        borderColor: colors.glassBorder,
        borderWidth: 1.5,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: colors.primary,
        borderWidth: 2,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      premium: {
        backgroundColor: colors.premium,
        borderWidth: 0,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : undefined,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: Typography.fontFamily.regular,
      fontWeight: Typography.fontWeight.semiBold as TextStyle['fontWeight'],
      textAlign: 'center',
    };

    const sizeStyles: Record<ButtonSize, TextStyle> = {
      sm: { fontSize: Typography.fontSize.sm },
      md: { fontSize: Typography.fontSize.base },
      lg: { fontSize: Typography.fontSize.lg + 1 },
    };

    const variantTextColors: Record<ButtonVariant, string> = {
      primary: colors.textInverse,
      secondary: colors.text,
      outline: colors.primary,
      ghost: colors.text,
      premium: colors.text,
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      color: variantTextColors[variant],
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[getButtonStyle(), styles.buttonContainer, style]}
    >
      {variant === 'secondary' && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={15}
          reducedTransparencyFallbackColor={colors.glassBackground}
        />
      )}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'outline' || variant === 'ghost'
                ? colors.primary
                : colors.textInverse
            }
            size="small"
          />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
});
