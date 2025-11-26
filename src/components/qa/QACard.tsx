import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@hooks/useTheme';
import { Typography, Spacing, Shadows } from '@theme';
import type { QAQuestion } from '@types';

interface QACardProps {
  question: QAQuestion;
  onLike: (questionId: string) => void;
  onUnlike: (questionId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Cardiac: '#EF4444',
  Pharmacology: '#8B5CF6',
  Endocrine: '#F59E0B',
  Pediatric: '#EC4899',
  Maternal: '#10B981',
  'Mental Health': '#3B82F6',
  'Medical-Surgical': '#6366F1',
  Fundamentals: '#14B8A6',
  'Critical Care': '#DC2626',
  'Community Health': '#059669',
  Other: '#6B7280',
};

const getUserInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const QACard: React.FC<QACardProps> = ({ question, onLike, onUnlike }) => {
  const { colors, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const isLongAnswer = question.answer.length > 200;
  const shouldShowExpandButton = isLongAnswer;
  const displayAnswer = isExpanded || !isLongAnswer 
    ? question.answer 
    : question.answer.substring(0, 200) + '...';

  const categoryColor = CATEGORY_COLORS[question.category || 'Other'] || CATEGORY_COLORS.Other;

  const handleLikePress = () => {
    // Animate the button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (question.isLikedByCurrentUser) {
      onUnlike(question.id);
    } else {
      onLike(question.id);
    }
  };

  const dynamicStyles = useMemo(
    () => ({
      card: {
        backgroundColor: isDark
          ? 'rgba(26, 31, 46, 0.5)'
          : 'rgba(255, 255, 255, 0.4)',
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(255, 255, 255, 0.6)',
        ...Shadows.lg,
        shadowColor: isDark ? '#000000' : colors.glassShadow,
        shadowOpacity: isDark ? 0.5 : 0.15,
      } as ViewStyle,
      avatar: {
        backgroundColor: isDark
          ? 'rgba(139, 92, 246, 0.2)'
          : 'rgba(139, 92, 246, 0.15)',
        borderColor: isDark
          ? 'rgba(139, 92, 246, 0.4)'
          : 'rgba(139, 92, 246, 0.3)',
      } as ViewStyle,
      avatarText: {
        color: isDark ? '#A78BFA' : '#7C3AED',
      } as TextStyle,
      userName: {
        color: isDark ? '#FFFFFF' : '#1A1A1A',
      } as TextStyle,
      timeAgo: {
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
      } as TextStyle,
      questionText: {
        color: isDark ? '#FFFFFF' : '#111827',
      } as TextStyle,
      divider: {
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.08)',
      } as ViewStyle,
      answerLabel: {
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
      } as TextStyle,
      answerText: {
        color: isDark ? 'rgba(255, 255, 255, 0.95)' : '#1F2937',
      } as TextStyle,
      expandButton: {
        color: colors.primary,
      } as TextStyle,
      likeButton: {
        backgroundColor: question.isLikedByCurrentUser
          ? isDark
            ? 'rgba(16, 185, 129, 0.2)'
            : 'rgba(16, 185, 129, 0.1)'
          : isDark
          ? 'rgba(31, 41, 55, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        borderColor: question.isLikedByCurrentUser
          ? colors.accent
          : isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.08)',
      } as ViewStyle,
      likeCount: {
        color: question.isLikedByCurrentUser
          ? colors.accent
          : isDark
          ? 'rgba(255, 255, 255, 0.7)'
          : 'rgba(0, 0, 0, 0.6)',
      } as TextStyle,
    }),
    [colors, isDark, question.isLikedByCurrentUser],
  );

  return (
    <View style={[styles.card, dynamicStyles.card]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, dynamicStyles.avatar]}>
          <Text style={[styles.avatarText, dynamicStyles.avatarText]}>
            {getUserInitials(question.userName)}
          </Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.userName, dynamicStyles.userName]}>
            {question.userName}
          </Text>
          <Text style={[styles.timeAgo, dynamicStyles.timeAgo]}>
            {getTimeAgo(question.createdAt)}
          </Text>
        </View>
        {question.category && (
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${categoryColor}20`, borderColor: `${categoryColor}40` },
            ]}
          >
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {question.category}
            </Text>
          </View>
        )}
      </View>

      {/* Question */}
      <View style={styles.questionSection}>
        <Text style={[styles.questionText, dynamicStyles.questionText]}>
          {question.questionText}
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, dynamicStyles.divider]} />

      {/* Answer */}
      <View style={styles.answerSection}>
        <Text style={[styles.answerLabel, dynamicStyles.answerLabel]}>
          ANSWER
        </Text>
        <Text style={[styles.answerText, dynamicStyles.answerText]}>
          {displayAnswer}
        </Text>
        {shouldShowExpandButton && (
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.expandButton}
          >
            <View style={styles.expandButtonContent}>
              <Text style={[styles.expandButtonText, dynamicStyles.expandButton]}>
                {isExpanded ? 'Show less' : 'Read more'}
              </Text>
              {isExpanded ? (
                <ChevronUp size={16} color={colors.primary} />
              ) : (
                <ChevronDown size={16} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Like Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleLikePress}
          style={[styles.likeButton, dynamicStyles.likeButton]}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.likeButtonContent,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Heart
              size={20}
              color={question.isLikedByCurrentUser ? colors.accent : colors.textSecondary}
              fill={question.isLikedByCurrentUser ? colors.accent : 'transparent'}
            />
            <Text style={[styles.likeCount, dynamicStyles.likeCount]}>
              {question.likes}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.regular,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.regular,
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.regular,
  },
  questionSection: {
    marginBottom: Spacing.md,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily: Typography.fontFamily.regular,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  answerSection: {
    marginBottom: Spacing.md,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
    textTransform: 'uppercase',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Typography.fontFamily.regular,
  },
  expandButton: {
    marginTop: Spacing.sm,
  },
  expandButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: Spacing.xs - 2,
    fontFamily: Typography.fontFamily.regular,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    ...Shadows.sm,
  },
  likeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
});

