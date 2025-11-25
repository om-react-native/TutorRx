import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '@hooks/useTheme';
import { Typography, Spacing } from '@theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={[styles.inputContainer, { borderRadius: 20 }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={15}
          reducedTransparencyFallbackColor={colors.glassBackground}
        />
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.glassBackground,
              borderColor: error
                ? colors.error
                : isFocused
                ? colors.primary
                : colors.glassBorder,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <RNTextInput
            {...props}
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: Typography.fontFamily.regular,
                fontSize: Typography.fontSize.base,
              },
              inputStyle,
            ]}
            placeholderTextColor={colors.textSecondary}
            onFocus={e => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as TextStyle['fontWeight'],
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderRadius: 20,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  leftIcon: {
    marginRight: Spacing.md,
  },
  rightIcon: {
    marginLeft: Spacing.md,
  },
  error: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
});
