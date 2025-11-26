import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useMemo } from 'react';
import { Spacing, Typography } from '@theme';
import { useTheme } from '@hooks/useTheme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    paddingBottom: Spacing['4xl'] + 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 14,
    opacity: 0.9,
  },
  profileButtonWrapper: {
    position: 'relative',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: '700',
  },
  crownBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mainFeaturesContainer: {
    marginBottom: Spacing.xl,
  },
  mainFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingVertical: Spacing.lg + 4,
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainFeatureText: {
    fontSize: 17,
    fontWeight: '500',
    marginLeft: Spacing.md,
  },
  recentActivityCard: {
    padding: Spacing.lg,
    paddingVertical: Spacing.lg + 4,
    borderRadius: 20,
  },
  recentActivityTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 15,
    marginLeft: Spacing.md,
    flex: 1,
  },
});

export const useStyles = () => {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      // Header styles
      logoContainer: (): ViewStyle => ({
        backgroundColor: colors.primary,
      }),
      appName: (): TextStyle => ({
        color: '#FFFFFF',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      }),
      tagline: (): TextStyle => ({
        color: '#FFFFFF',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
      }),
      profileButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
      }),
      profileInitials: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
      }),
      crownBadge: (): ViewStyle => ({
        backgroundColor: isDark ? colors.backgroundSecondary : '#FFFFFF',
      }),

      // Main feature button styles
      mainFeatureButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: colors.glassBorder,
      }),
      iconContainer: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        borderColor: colors.glassBorder,
      }),
      mainFeatureIcon: (): { color: string } => ({
        color: isDark ? '#FFFFFF' : colors.text,
      }),
      mainFeatureText: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '500',
      }),

      // Recent activity styles
      recentActivityCard: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: colors.glassBorder,
      }),
      recentActivityTitle: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
      }),
      activityIconContainer: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: colors.glassBorder,
      }),
      activityIcon: (): { color: string } => ({
        color: isDark ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary,
      }),
      activityText: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
      }),
      activityItemLast: (): ViewStyle => ({
        marginBottom: 0,
      }),
    }),
    [colors, isDark],
  );
};

