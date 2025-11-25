import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useMemo } from 'react';
import { Spacing, Typography } from '@theme';
import { useTheme } from '@hooks/useTheme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.xl + 40,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.xl + 20,
    right: Spacing.xl,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  crownContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: Spacing.xl + Spacing.lg,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: Spacing.xl + Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg + Spacing.sm,
  },
  featureItemLast: {
    marginBottom: 0,
  },
  checkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  subscribeButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  premiumText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
  restoreButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
  },
});

export const useStyles = () => {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      closeButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
      }),
      crownContainer: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 215, 0, 0.15)'
          : 'rgba(255, 215, 0, 0.1)',
      }),
      title: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
        textShadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      }),
      subtitle: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '500',
      }),
      checkIconContainer: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.4)',
      }),
      featureTitle: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '500',
      }),
      subscribeButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(255, 255, 255, 0.6)',
      }),
      subscribeButtonText: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
      }),
      premiumBadge: (): ViewStyle => ({
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
      }),
      premiumText: (): TextStyle => ({
        color: colors.premium,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
      }),
      restoreButtonText: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '600',
      }),
      termsText: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.5)' : colors.textTertiary,
        fontFamily: Typography.fontFamily.regular,
      }),
    }),
    [colors, isDark],
  );
};

