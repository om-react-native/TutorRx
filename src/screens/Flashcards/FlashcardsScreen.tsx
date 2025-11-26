import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { GradientBackground, Loading } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { firestoreService } from '@services/firebase';
import type { RootStackParamList } from '@navigation/types';
import type { Flashcard } from '../../types/flashcard';
import { styles, useStyles } from './FlashcardsScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type FlashcardsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const FlashcardsScreen: React.FC = () => {
  const navigation = useNavigation<FlashcardsScreenNavigationProp>();
  const { isDark } = useTheme();
  const dynamicStyles = useStyles();
  const { user } = useAuthStore();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const currentCard = useMemo(
    () => flashcards[currentIndex],
    [flashcards, currentIndex],
  );

  // Fetch flashcards from Firestore
  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      setIsLoading(true);
      const data = await firestoreService.getAllFlashcards();
      setFlashcards(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFlashcard = () => {
    navigation.navigate('CreateFlashcard', { mode: 'create' });
  };

  const handleEditFlashcard = (flashcardId: string) => {
    navigation.navigate('CreateFlashcard', { mode: 'edit', flashcardId });
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    Alert.alert(
      'Delete Flashcard',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.deleteFlashcard(flashcardId);
              await fetchFlashcards();
              // Reset to first card if current is deleted
              if (currentIndex >= flashcards.length - 1) {
                setCurrentIndex(Math.max(0, flashcards.length - 2));
              }
              setShowAnswer(false);
              Alert.alert('Success', 'Flashcard deleted successfully');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to delete flashcard',
              );
            }
          },
        },
      ],
    );
  };

  const handleLongPress = () => {
    if (!user?.isAdmin || !currentCard) return;

    Alert.alert('Manage Flashcard', 'What would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Edit',
        onPress: () => handleEditFlashcard(currentCard.id),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDeleteFlashcard(currentCard.id),
      },
    ]);
  };

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();

    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(pan, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    const newIndex =
      direction === 'right'
        ? Math.max(currentIndex - 1, 0)
        : Math.min(currentIndex + 1, flashcards.length - 1);

    pan.setValue({ x: 0, y: 0 });
    scale.setValue(1);
    setCurrentIndex(newIndex);
    setShowAnswer(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 5;
      },
      onPanResponderGrant: () => {
        const currentX = (pan.x as any)._value || 0;
        const currentY = (pan.y as any)._value || 0;
        pan.setOffset({
          x: currentX,
          y: currentY,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();

        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe right - go to previous
          if (currentIndex > 0) {
            forceSwipe('right');
          } else {
            resetPosition();
          }
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left - go to next
          if (currentIndex < flashcards.length - 1) {
            forceSwipe('left');
          } else {
            resetPosition();
          }
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < flashcards.length - 1;

  const handleShowAnswer = () => {
    setShowAnswer(prev => !prev);
  };

  const handleNext = () => {
    if (canGoNext) {
      forceSwipe('left');
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      forceSwipe('right');
    }
  };

  // 3D Transform animations
  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const rotateY = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['30deg', '0deg', '-30deg'],
    extrapolate: 'clamp',
  });

  const opacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const cardScale = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  const animatedCardStyle = {
    transform: [
      { translateX: pan.x },
      { rotate },
      { perspective: 1000 },
      { rotateY },
      { scale: cardScale },
    ],
    opacity,
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading flashcards..." />;
  }

  if (flashcards.length === 0) {
    return (
      <GradientBackground>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerLabel, dynamicStyles.headerLabel()]}>
                  Flashcard
                </Text>
                <Text style={[styles.headerTitle, dynamicStyles.headerTitle()]}>
                  Master key NCLEX concepts
                </Text>
              </View>
              {user?.isAdmin && (
                <TouchableOpacity
                  onPress={handleCreateFlashcard}
                  style={[styles.addButton, dynamicStyles.addButton()]}
                >
                  <Plus size={24} color={isDark ? '#E5E7EB' : '#111827'} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, dynamicStyles.emptyText()]}>
                No flashcards available yet.
              </Text>
              {user?.isAdmin && (
                <Text
                  style={[styles.emptySubtext, dynamicStyles.emptySubtext()]}
                >
                  Tap the + button to create your first flashcard!
                </Text>
              )}
            </View>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerLabel, dynamicStyles.headerLabel()]}>
                Flashcard
              </Text>
              <Text style={[styles.headerTitle, dynamicStyles.headerTitle()]}>
                Master key NCLEX concepts
              </Text>
            </View>
            {user?.isAdmin && (
              <TouchableOpacity
                onPress={handleCreateFlashcard}
                style={[styles.addButton, dynamicStyles.addButton()]}
              >
                <Plus size={24} color={isDark ? '#E5E7EB' : '#111827'} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.cardOuterContainer}>
            {/* Background card (next card preview) */}
            {currentIndex < flashcards.length - 1 && (
              <View
                style={[
                  styles.cardShadowWrapper,
                  dynamicStyles.cardShadowWrapper(),
                  styles.backgroundCard,
                ]}
              >
                <LinearGradient
                  style={styles.cardGradient}
                  colors={dynamicStyles.cardGradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </View>
            )}

            {/* Main animated card */}
            <Animated.View
              style={[
                styles.cardShadowWrapper,
                dynamicStyles.cardShadowWrapper(),
                animatedCardStyle,
              ]}
              {...panResponder.panHandlers}
            >
              <TouchableOpacity
                activeOpacity={1}
                onLongPress={handleLongPress}
                style={styles.cardTouchable}
              >
                <LinearGradient
                  style={styles.cardGradient}
                  colors={dynamicStyles.cardGradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.questionSection}>
                      <Text
                        style={[
                          styles.cardTopLabel,
                          dynamicStyles.cardTopLabel(),
                        ]}
                      >
                        {currentCard.category}
                      </Text>
                      <Text
                        style={[
                          styles.questionText,
                          dynamicStyles.questionText(),
                        ]}
                      >
                        {currentCard.question}
                      </Text>
                    </View>

                    <View style={styles.answerSection}>
                      <View style={[styles.divider, dynamicStyles.divider()]} />

                      <ScrollView
                        style={styles.answerScrollView}
                        contentContainerStyle={styles.answerScrollContent}
                        showsVerticalScrollIndicator={false}
                      >
                        <Text
                          style={[
                            styles.answerLabel,
                            dynamicStyles.answerLabel(),
                          ]}
                        >
                          Answer
                        </Text>

                        {showAnswer ? (
                          <Text
                            style={[
                              styles.answerText,
                              dynamicStyles.answerText(),
                            ]}
                          >
                            {currentCard.answer}
                          </Text>
                        ) : (
                          <Text
                            style={[
                              styles.hiddenAnswerText,
                              dynamicStyles.hiddenAnswerText(),
                            ]}
                          >
                            Tap the button below to reveal the answer.
                          </Text>
                        )}
                      </ScrollView>

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={handleShowAnswer}
                          style={[
                            styles.showAnswerButton,
                            dynamicStyles.showAnswerButton(),
                          ]}
                        >
                          <Text
                            style={[
                              styles.showAnswerText,
                              dynamicStyles.showAnswerText(),
                            ]}
                          >
                            {showAnswer ? 'Hide Answer' : 'Show Answer'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.paginationContainer}>
            <Text style={[styles.progressText, dynamicStyles.progressText()]}>
              Card {currentIndex + 1} of {flashcards.length}
            </Text>

            <View style={styles.dotsContainer}>
              {flashcards.map((card, index) => (
                <View
                  key={card.id}
                  style={[
                    styles.dot,
                    dynamicStyles.dot(index === currentIndex),
                  ]}
                />
              ))}
            </View>

            <View style={styles.navButtonsContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePrev}
                disabled={!canGoPrev}
              >
                <View
                  style={[
                    styles.navButton,
                    dynamicStyles.navButton(),
                    !canGoPrev && styles.navButtonDisabled,
                  ]}
                >
                  <ChevronLeft
                    size={18}
                    color={isDark ? '#E5E7EB' : '#111827'}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNext}
                disabled={!canGoNext}
              >
                <View
                  style={[
                    styles.navButton,
                    dynamicStyles.navButton(),
                    !canGoNext && styles.navButtonDisabled,
                  ]}
                >
                  <ChevronRight
                    size={18}
                    color={isDark ? '#E5E7EB' : '#111827'}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </GradientBackground>
  );
};
