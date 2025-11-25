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
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  premiumCrownBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  profileCard: {
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  premiumSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  premiumLeft: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: '500',
  },
  themeToggleButton: {
    width: 60,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  themeToggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

export const useStyles = () => {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      // Profile header styles
      avatarContainer: (): ViewStyle => ({
        backgroundColor: colors.primary,
      }),
      avatarInitials: (): TextStyle => ({
        color: '#FFFFFF',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
      }),
      cameraButton: (): ViewStyle => ({
        backgroundColor: colors.primary,
      }),
      premiumCrownBadge: (): ViewStyle => ({
        backgroundColor: isDark ? colors.backgroundSecondary : '#FFFFFF',
      }),
      userName: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
        textShadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }),
      userEmail: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
      }),

      // Profile card
      profileCard: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: colors.glassBorder,
      }),

      // Premium section
      premiumTitle: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
      }),
      premiumSubtitle: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
      }),

      // Menu styles
      menuIconContainer: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.6)',
      }),
      menuItemText: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : colors.text,
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '500',
      }),
      logoutText: (): TextStyle => ({
        color: '#EF4444',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '500',
      }),

      // Version text
      versionText: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.5)' : colors.textTertiary,
        fontFamily: Typography.fontFamily.regular,
      }),

      // Theme toggle
      themeToggleButton: (): ViewStyle => ({
        backgroundColor: isDark ? colors.primary : colors.textTertiary,
        alignItems: isDark ? 'flex-end' : 'flex-start',
      }),
    }),
    [colors, isDark],
  );
};

