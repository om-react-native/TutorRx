import { StyleSheet, TextStyle, ViewStyle, Platform } from 'react-native';
import { useMemo } from 'react';
import { Spacing, Typography, Shadows } from '@theme';
import { useTheme } from '@hooks/useTheme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl + 10,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.xs - 2,
    lineHeight: 38,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  listWrapper: {
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    marginTop: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 2,
    paddingBottom: Spacing.md + 2,
    fontSize: 15,
    maxHeight: 100,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export const useStyles = () => {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      headerLabel: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '600',
      }),
      headerTitle: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
      }),
      headerSubtitle: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        fontFamily: Typography.fontFamily.regular,
      }),
      loadingText: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        fontFamily: Typography.fontFamily.regular,
      }),
      emptyText: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
      }),
      emptySubtext: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        fontFamily: Typography.fontFamily.regular,
      }),
      inputContainer: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(15, 20, 25, 0.98)'
          : 'rgba(255, 255, 255, 0.98)',
        borderTopColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.08)',
        ...Platform.select({
          ios: {
            shadowColor: isDark ? '#000000' : colors.glassShadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.5 : 0.15,
            shadowRadius: 20,
          },
          android: {
            elevation: 8,
          },
        }),
      }),
      input: (): TextStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.03)',
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(0, 0, 0, 0.1)',
        color: isDark ? '#FFFFFF' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
      }),
      sendButton: (): ViewStyle => ({
        backgroundColor: colors.primary,
        ...Shadows.md,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
      }),
    }),
    [colors, isDark],
  );
};

