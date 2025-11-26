import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Spacing, Typography } from '@theme';
import { useTheme } from '@hooks/useTheme';
import { useMemo } from 'react';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xl + Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.lg,
    fontFamily: Typography.fontFamily.semiBold,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: Spacing.xs,
    opacity: 0.7,
    fontFamily: Typography.fontFamily.regular,
  },
  listContainer: {
    padding: Spacing.lg,
  },
  chatItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.semiBold,
  },
  chatPreview: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  chatDate: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: Typography.fontFamily.regular,
  },
  deleteButton: {
    padding: Spacing.sm,
    justifyContent: 'center',
  },
});

export const useStyles = () => {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      headerTitle: (): TextStyle => ({
        color: colors.text,
      }),
      loadingText: (): TextStyle => ({
        color: colors.textSecondary,
      }),
      emptyText: (): TextStyle => ({
        color: colors.text,
      }),
      emptySubtext: (): TextStyle => ({
        color: colors.textSecondary,
      }),
      chatItem: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
      }),
      chatIcon: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(99, 102, 241, 0.2)'
          : 'rgba(99, 102, 241, 0.1)',
      }),
      chatTitle: (): TextStyle => ({
        color: colors.text,
      }),
      chatPreview: (): TextStyle => ({
        color: colors.textSecondary,
      }),
      chatDate: (): TextStyle => ({
        color: colors.textSecondary,
      }),
    }),
    [colors, isDark],
  );
};

