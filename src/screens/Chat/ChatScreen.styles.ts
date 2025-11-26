import { StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { useMemo } from 'react';
import { Spacing, Typography } from '@theme';
import { useTheme } from '@hooks/useTheme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    // paddingBottom: Spacing.md,
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
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImageContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.9,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  messagesContent: {
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 110 : 100,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: Spacing.lg,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.xs,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 13,
    opacity: 0.7,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  assistantTimestamp: {
    textAlign: 'left',
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    // marginBottom: Spacing.xs,
  },
  leftActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  footerDisclaimer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxs,
  },
  previewContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  previewItem: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  previewAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    gap: Spacing.xs,
    minWidth: 120,
  },
  previewAudioText: {
    fontSize: 14,
    marginLeft: Spacing.xs,
  },
  previewCloseButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: Spacing.xs,
  },
  messageImage: {
    width: 250,
    height: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: Spacing.xs,
  },
  imageDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  imageDownloadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  audioPlayerText: {
    fontSize: 14,
    marginLeft: Spacing.xs,
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
      newChatButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
      }),
      headerButton: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
      }),

      // Title section styles
      title: (): TextStyle => ({
        color: '#FFFFFF',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      }),
      subtitle: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.7)',
        fontFamily: Typography.fontFamily.regular,
        fontWeight: '500',
        textShadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: isDark ? 3 : 2,
      }),

      // Message bubble styles
      userMessageBubble: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(200, 195, 220, 0.9)'
          : 'rgba(230, 225, 245, 0.95)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(200, 195, 220, 0.3)'
          : 'rgba(200, 195, 220, 0.4)',
      }),
      assistantMessageBubble: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(180, 170, 210, 0.8)'
          : 'rgba(210, 200, 235, 0.85)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(180, 170, 210, 0.3)'
          : 'rgba(180, 170, 210, 0.4)',
      }),
      userMessageText: (): TextStyle => ({
        color: isDark ? '#1A1A1A' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
      }),
      assistantMessageText: (): TextStyle => ({
        color: isDark ? '#1A1A1A' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
      }),
      timestamp: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.65)',
        fontFamily: Typography.fontFamily.regular,
        textShadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: isDark ? 2 : 1,
      }),

      // Input styles
      inputContainer: (): ViewStyle => ({
        backgroundColor: 'transparent',
      }),
      inputWrapper: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 0.5)',
        borderRadius: 24,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
        borderColor: isDark
          ? colors.glassBorder
          : 'rgba(255, 255, 255, 0.7)',
      }),
      actionButton: (isPremium: boolean): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.6)',
        opacity: isPremium ? 1 : 0.5,
      }),
      recordingActive: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(239, 68, 68, 0.2)'
          : 'rgba(239, 68, 68, 0.15)',
      }),
      input: (): TextStyle => ({
        backgroundColor: 'transparent',
        color: isDark ? '#FFFFFF' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
      }),
      sendButton: (isEnabled: boolean): ViewStyle => ({
        backgroundColor: isEnabled
          ? colors.primary
          : isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)',
      }),
      previewAudio: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(255, 255, 255, 0.6)',
      }),
      previewAudioText: (): TextStyle => ({
        color: isDark ? '#FFFFFF' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
      }),
      audioPlayer: (): ViewStyle => ({
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(255, 255, 255, 0.6)',
      }),
      audioPlayerText: (): TextStyle => ({
        color: isDark ? '#1A1A1A' : '#1A1A1A',
        fontFamily: Typography.fontFamily.regular,
      }),
      imageDownloadButton: (isPremium: boolean): ViewStyle => ({
        backgroundColor: isPremium
          ? `${colors.primary}15`
          : `${colors.textSecondary}10`,
        borderWidth: 1,
        borderColor: isPremium ? colors.primary : colors.textSecondary,
        opacity: isPremium ? 1 : 0.6,
      }),
      imageDownloadText: (isPremium: boolean): TextStyle => ({
        color: isPremium ? colors.primary : colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
      }),
      previewCloseButton: (): ViewStyle => ({
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }),
    }),
    [colors, isDark],
  );
};

