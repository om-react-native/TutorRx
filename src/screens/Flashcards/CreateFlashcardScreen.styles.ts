import { StyleSheet } from 'react-native';
import { useTheme } from '@hooks/useTheme';
import { Spacing, Typography } from '@theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl + Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  formContainer: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  firstSectionTitle: {
    marginTop: 0,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  answerTextArea: {
    minHeight: 120,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    minHeight: 56,
  },
  difficultyText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '700',
  },
});

export const useStyles = () => {
  const { colors, isDark } = useTheme();

  return {
    backButton: () => ({
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.06)',
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
    }),
    headerTitle: () => ({
      color: isDark ? '#FFFFFF' : '#111827',
      fontFamily: Typography.fontFamily.regular,
    }),
    formContainer: () => ({
      backgroundColor: isDark
        ? 'rgba(17, 24, 39, 0.6)'
        : 'rgba(255, 255, 255, 0.7)',
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 16,
      elevation: 8,
    }),
    sectionTitle: () => ({
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      fontFamily: Typography.fontFamily.regular,
    }),
    difficultyButton: (selected: boolean) => ({
      backgroundColor: selected
        ? isDark
          ? 'rgba(139, 92, 246, 0.25)'
          : 'rgba(139, 92, 246, 0.15)'
        : isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)',
      borderColor: selected
        ? isDark
          ? '#A78BFA'
          : '#8B5CF6'
        : isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.12)',
      shadowColor: selected ? (isDark ? '#8B5CF6' : '#8B5CF6') : 'transparent',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: selected ? 0.3 : 0,
      shadowRadius: 8,
      elevation: selected ? 4 : 0,
    }),
    difficultyText: (selected: boolean) => ({
      color: selected
        ? isDark
          ? '#E9D5FF'
          : '#6D28D9'
        : isDark
        ? 'rgba(255, 255, 255, 0.6)'
        : 'rgba(0, 0, 0, 0.5)',
      fontFamily: Typography.fontFamily.regular,
    }),
  };
};
