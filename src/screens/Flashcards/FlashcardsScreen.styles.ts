import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useMemo } from 'react';
import { Spacing, Typography, Shadows } from '@theme';
import { useTheme } from '@hooks/useTheme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl+10 ,
    paddingBottom:100,
  },
  header: {
    marginBottom: Spacing.lg,
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
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
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  cardOuterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  cardShadowWrapper: {
    width: '100%',
    maxWidth: 420,
    height: 500,
  },
  backgroundCard: {
    position: 'absolute',
    transform: [{ scale: 0.95 }, { translateY: 8 }],
    opacity: 0.6,
  },
  cardTouchable: {
    flex: 1,
    borderRadius: 24,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  questionSection: {
    marginBottom: Spacing.lg,
  },
  cardTopLabel: {
    fontSize: 13,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  answerSection: {
    flex: 1,
  },
  answerScrollView: {
    flex: 1,
  },
  answerScrollContent: {
    flexGrow: 1,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.lg,
  },
  answerLabel: {
    fontSize: 12,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  hiddenAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  buttonContainer: {
    paddingTop: Spacing.md,
  },
  showAnswerButton: {
    borderRadius: 999,
    paddingHorizontal: Spacing.xl + 4,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showAnswerText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  paginationContainer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
});

export const useStyles = () => {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      headerLabel: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
        textTransform: 'uppercase',
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
      addButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(139, 92, 246, 0.2)'
          : 'rgba(139, 92, 246, 0.15)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(139, 92, 246, 0.4)'
          : 'rgba(139, 92, 246, 0.3)',
      }),
      emptyText: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
      }),
      emptySubtext: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        fontFamily: Typography.fontFamily.regular,
      }),
      cardShadowWrapper: (): ViewStyle => ({
        borderRadius: 24,
        backgroundColor: isDark
          ? 'rgba(17, 24, 39, 0.95)'
          : 'rgba(255, 255, 255, 0.85)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
        ...Shadows.lg,
        shadowColor: isDark ? '#000000' : colors.glassShadow,
        shadowOpacity: isDark ? 0.5 : 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      }),
      cardGradientColors: isDark
        ? ['#1F2937', '#111827']
        : ['#EFF6FF', '#DBEAFE'],
      cardTopLabel: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '500',
      }),
      questionText: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : '#111827',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
      }),
      divider: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.08)',
      }),
      answerLabel: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
        fontFamily: Typography.fontFamily.regular,
        textTransform: 'uppercase',
        fontWeight: '600',
      }),
      answerText: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.95)' : '#1F2937',
        fontFamily: Typography.fontFamily.regular,
      }),
      hiddenAnswerText: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        fontFamily: Typography.fontFamily.regular,
        fontStyle: 'italic',
      }),
      showAnswerButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(59, 130, 246, 0.2)'
          : 'rgba(59, 130, 246, 1)',
        borderWidth: isDark ? 1 : 0,
        borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
        ...Shadows.sm,
      }),
      showAnswerText: (): TextStyle => ({
        color: isDark ? '#60A5FA' : '#FFFFFF',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '600',
      }),
      progressText: (): TextStyle => ({
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        fontFamily: Typography.fontFamily.regular,
      }),
      dot: (active: boolean): ViewStyle => ({
        backgroundColor: active
          ? isDark
            ? '#60A5FA'
            : '#3B82F6'
          : isDark
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(0, 0, 0, 0.15)',
      }),
      navButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(31, 41, 55, 0.9)'
          : 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.08)',
        ...Shadows.sm,
      }),
    }),
    [colors, isDark],
  );
};


