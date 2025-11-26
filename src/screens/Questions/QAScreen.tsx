import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Send, MessageCircleQuestion } from 'lucide-react-native';
import { GradientBackground } from '@components/common';
import { QACard } from '@components/qa';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { firestoreService } from '@services/firebase/firestore';
import { generateQAAnswer } from '@services/openai/qaService';
import type { QAQuestion } from '@/types';
import { styles, useStyles } from './QAScreen.styles';

const QUESTIONS_PER_PAGE = 10;

export const QAScreen: React.FC = () => {
  const { colors } = useTheme();
  const dynamicStyles = useStyles();
  const { user } = useAuthStore();

  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [questionInput, setQuestionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());

  const lastDocRef = useRef<any>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load initial questions and set up real-time listener
  useEffect(() => {
    loadInitialQuestions();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Check which questions the current user has liked
  useEffect(() => {
    const checkLikedQuestions = async () => {
      if (!user?.uid || questions.length === 0) return;

      const likedSet = new Set<string>();
      for (const question of questions) {
        const isLiked = await firestoreService.checkIfUserLikedQA(
          question.id,
          user.uid,
        );
        if (isLiked) {
          likedSet.add(question.id);
        }
      }
      setLikedQuestions(likedSet);
    };

    checkLikedQuestions();
  }, [questions, user?.uid]);

  const loadInitialQuestions = async () => {
    try {
      setLoading(true);

      // Clean up previous listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Prime pagination info for the first page (without updating UI yet)
      try {
        const page = await firestoreService.getQAQuestions(QUESTIONS_PER_PAGE);
        lastDocRef.current = page.lastDoc ?? null;
        setHasMore(page.hasMore);
      } catch (error) {
        console.error('Error priming Q&A pagination:', error);
        // If this fails, we'll still try to attach the listener below
        lastDocRef.current = null;
        setHasMore(true);
      }

      // Set up real-time listener for the first page
      const unsubscribe = firestoreService.subscribeToQAQuestions(
        QUESTIONS_PER_PAGE,
        updatedQuestions => {
          const questionsWithDates = updatedQuestions.map(q => ({
            ...q,
            createdAt: q.createdAt?.toDate?.() || new Date(q.createdAt),
          }));
          setQuestions(questionsWithDates);
          setLoading(false);
        },
        error => {
          console.error('Error subscribing to questions:', error);
          Alert.alert('Error', 'Failed to load questions. Please try again.');
          setLoading(false);
        },
      );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
      setLoading(false);
    }
  };

  const loadMoreQuestions = async () => {
    // Don't load more if already loading, no more pages, or we don't
    // have a pagination cursor yet (still on the first page).
    if (loadingMore || !hasMore || !lastDocRef.current) return;

    try {
      setLoadingMore(true);

      const result = await firestoreService.getQAQuestions(
        QUESTIONS_PER_PAGE,
        lastDocRef.current,
      );

      const newQuestions = result.questions.map((q: any) => ({
        ...q,
        createdAt: q.createdAt?.toDate?.() || new Date(q.createdAt),
      }));

      setQuestions(prev => [...prev, ...newQuestions]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more questions:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    lastDocRef.current = null;
    setHasMore(true);
    await loadInitialQuestions();
    setRefreshing(false);
  };

  const handleSubmitQuestion = async () => {
    if (!questionInput.trim() || !user) {
      return;
    }

    const questionText = questionInput.trim();
    setQuestionInput('');
    setSubmitting(true);

    try {
      // Create the question in Firestore with placeholder answer
      const questionId = await firestoreService.createQAQuestion({
        questionText,
        userId: user.uid,
        userName: user.name || 'Anonymous',
      });

      // Scroll to top to show the new question
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 500);

      // Generate AI answer in the background
      generateQAAnswer(questionText)
        .then(async result => {
          await firestoreService.updateQAQuestionAnswer(
            questionId,
            result.answer,
            result.category,
          );
        })
        .catch(error => {
          console.error('Error generating answer:', error);
          // Update with error message
          firestoreService.updateQAQuestionAnswer(
            questionId,
            'Unable to generate answer. Please try again later.',
            'Other',
          );
        });
    } catch (error) {
      console.error('Error submitting question:', error);
      Alert.alert('Error', 'Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (questionId: string) => {
    if (!user?.uid) return;

    try {
      await firestoreService.likeQAQuestion(questionId, user.uid);
      setLikedQuestions(prev => new Set(prev).add(questionId));
    } catch (error) {
      console.error('Error liking question:', error);
      Alert.alert('Error', 'Failed to like question. Please try again.');
    }
  };

  const handleUnlike = async (questionId: string) => {
    if (!user?.uid) return;

    try {
      await firestoreService.unlikeQAQuestion(questionId, user.uid);
      setLikedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    } catch (error) {
      console.error('Error unliking question:', error);
      Alert.alert('Error', 'Failed to unlike question. Please try again.');
    }
  };

  const renderQuestion = ({ item }: { item: QAQuestion }) => (
    <QACard
      question={{
        ...item,
        isLikedByCurrentUser: likedQuestions.has(item.id),
      }}
      onLike={handleLike}
      onUnlike={handleUnlike}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MessageCircleQuestion
          size={64}
          color={colors.textSecondary}
          strokeWidth={1.5}
        />
        <Text style={[styles.emptyText, dynamicStyles.emptyText()]}>
          No Questions Yet
        </Text>
        <Text style={[styles.emptySubtext, dynamicStyles.emptySubtext()]}>
          Be the first to ask an NCLEX question!
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -100 : -90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerLabel, dynamicStyles.headerLabel()]}>
              COMMUNITY
            </Text>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle()]}>
              Q&A
            </Text>
            <Text
              style={[styles.headerSubtitle, dynamicStyles.headerSubtitle()]}
            >
              Ask questions, share knowledge
            </Text>
          </View>
        </View>

        {/* Questions List */}
        <View style={styles.listWrapper}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, dynamicStyles.loadingText()]}>
                Loading questions...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={questions}
              renderItem={renderQuestion}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={renderFooter}
              onEndReached={loadMoreQuestions}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
            />
          )}
        </View>

        {/* Input Container */}
        <View style={[styles.inputContainer, dynamicStyles.inputContainer()]}>
          <TextInput
            style={[styles.input, dynamicStyles.input()]}
            placeholder="Ask a question..."
            placeholderTextColor={colors.textTertiary}
            value={questionInput}
            onChangeText={setQuestionInput}
            multiline
            maxLength={500}
            editable={!submitting}
          />
          <TouchableOpacity
            onPress={handleSubmitQuestion}
            disabled={!questionInput.trim() || submitting}
            style={[
              styles.sendButton,
              dynamicStyles.sendButton(),
              (!questionInput.trim() || submitting) &&
                styles.sendButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Send size={20} color={colors.textInverse} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};
