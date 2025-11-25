import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { GradientBackground } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { styles, useStyles } from './FlashcardsScreen.styles';

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const FLASHCARDS: Flashcard[] = [
  {
    id: '1',
    category: 'Medication Safety',
    question: 'What is a nursing intervention when administering opioids?',
    answer:
      'Assess respiratory status when giving opioids, as respiratory depression is a potential adverse effect.',
  },
  {
    id: '2',
    category: 'Cardiac',
    question: 'Which ECG change is most characteristic of myocardial ischemia?',
    answer:
      'ST-segment depression or T-wave inversion is commonly associated with myocardial ischemia.',
  },
  {
    id: '3',
    category: 'Fundamentals',
    question:
      'Before administering a blood transfusion, what is the priority nursing action?',
    answer:
      'Verify patient identity and blood product with another licensed nurse to reduce the risk of transfusion reactions.',
  },
  {
    id: '4',
    category: 'Respiratory',
    question:
      'For a client with COPD receiving oxygen therapy, what is an appropriate nursing intervention?',
    answer:
      'Administer the lowest liter flow of oxygen necessary to maintain prescribed SpO₂ and monitor for changes in level of consciousness or respiratory drive. COPD patients rely on hypoxic drive, so excessive oxygen can suppress their respiratory effort. Monitor ABGs, assess for CO₂ retention, and educate the patient about pursed-lip breathing and energy conservation techniques.',
  },
  {
    id: '5',
    category: 'Pediatric Nursing',
    question:
      'What are the key signs of increased intracranial pressure in an infant?',
    answer:
      'Key signs include a bulging or tense anterior fontanel, high-pitched cry, irritability, lethargy, vomiting (often projectile), bradycardia, widened pulse pressure, and irregular respirations. The infant may also exhibit poor feeding, downward deviation of the eyes (sunset eyes), and changes in pupil size or reactivity. Early recognition is critical to prevent herniation and permanent neurological damage.',
  },
];

export const FlashcardsScreen: React.FC = () => {
  const { isDark } = useTheme();
  const dynamicStyles = useStyles();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentCard = useMemo(() => FLASHCARDS[currentIndex], [currentIndex]);

  const animateCardChange = (direction: 'left' | 'right') => {
    const slideValue = direction === 'left' ? -50 : 50;

    // Fade out and slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideValue,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update the card
      const newIndex =
        direction === 'left'
          ? Math.min(currentIndex + 1, FLASHCARDS.length - 1)
          : Math.max(currentIndex - 1, 0);

      setCurrentIndex(newIndex);
      setShowAnswer(false);

      // Reset position and fade in
      slideAnim.setValue(-slideValue);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < FLASHCARDS.length - 1;

  const handleShowAnswer = () => {
    setShowAnswer(prev => !prev);
  };

  const handleNext = () => {
    if (canGoNext) {
      animateCardChange('left');
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      animateCardChange('right');
    }
  };

  const animatedCardStyle = {
    transform: [{ translateX: slideAnim }],
    opacity: fadeAnim,
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.headerLabel, dynamicStyles.headerLabel()]}>
              Flashcard
            </Text>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle()]}>
              Master key NCLEX concepts
            </Text>
          </View>

          <View style={styles.cardOuterContainer}>
            {/* Background card (next card preview) */}
            {currentIndex < FLASHCARDS.length - 1 && (
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
            >
              <LinearGradient
                style={styles.cardGradient}
                colors={dynamicStyles.cardGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View key={currentCard.id} style={styles.cardContent}>
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
            </Animated.View>
          </View>

          <View style={styles.paginationContainer}>
            <Text style={[styles.progressText, dynamicStyles.progressText()]}>
              {currentIndex + 1}/{FLASHCARDS.length}
            </Text>

            <View style={styles.dotsContainer}>
              {FLASHCARDS.map((card, index) => (
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
