import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@store';
import { firestoreService } from '@services/firebase';
import {
  Button,
  TextInput,
  Loading,
  GradientBackground,
  FrostedPanel,
} from '@components/common';
import { useTheme } from '@hooks/useTheme';
import type { RootStackParamList } from '@navigation/types';
import { styles, useStyles } from './CreateFlashcardScreen.styles';

const flashcardSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Please select a difficulty level' }),
  }),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

type CreateFlashcardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CreateFlashcard'
>;

type CreateFlashcardScreenRouteProp = RouteProp<
  RootStackParamList,
  'CreateFlashcard'
>;

export const CreateFlashcardScreen: React.FC = () => {
  const navigation = useNavigation<CreateFlashcardScreenNavigationProp>();
  const route = useRoute<CreateFlashcardScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const dynamicStyles = useStyles();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'easy' | 'medium' | 'hard'
  >('medium');

  const mode = route.params?.mode || 'create';
  const flashcardId = route.params?.flashcardId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: '',
      difficulty: 'medium',
    },
  });

  // Load existing flashcard if in edit mode
  useEffect(() => {
    if (mode === 'edit' && flashcardId) {
      loadFlashcard();
    }
  }, [mode, flashcardId]);

  const loadFlashcard = async () => {
    try {
      setIsLoading(true);
      const flashcard = await firestoreService.getFlashcardById(flashcardId!);
      if (flashcard) {
        setValue('question', flashcard.question);
        setValue('answer', flashcard.answer);
        setValue('category', flashcard.category);
        setValue('difficulty', flashcard.difficulty);
        setSelectedDifficulty(flashcard.difficulty);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load flashcard');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FlashcardFormData) => {
    if (!user?.isAdmin) {
      Alert.alert('Error', 'Only admins can create or edit flashcards');
      return;
    }

    try {
      setIsLoading(true);
      
      if (mode === 'edit' && flashcardId) {
        await firestoreService.updateFlashcard(flashcardId, data);
        Alert.alert('Success', 'Flashcard updated successfully');
      } else {
        await firestoreService.createFlashcard(user.uid, data);
        Alert.alert('Success', 'Flashcard created successfully');
      }
      
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
    setValue('difficulty', difficulty);
  };

  if (isLoading) {
    return <Loading fullScreen text={mode === 'edit' ? 'Loading flashcard...' : 'Saving flashcard...'} />;
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backButton, dynamicStyles.backButton()]}
            >
              <ArrowLeft size={24} color={isDark ? '#E5E7EB' : '#111827'} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle()]}>
              {mode === 'edit' ? 'Edit Flashcard' : 'Create Flashcard'}
            </Text>
            <View style={styles.backButton} />
          </View>

          {/* Form */}
          <View style={[styles.formContainer, dynamicStyles.formContainer()]}>
            <View style={styles.labelContainer}>
              <Text style={[styles.sectionTitle, styles.firstSectionTitle, dynamicStyles.sectionTitle()]}>
                Question
              </Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <Controller
              control={control}
              name="question"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="What is the nursing intervention when...?"
                  value={value}
                  onChangeText={onChange}
                  error={errors.question?.message}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
              )}
            />

            <View style={styles.labelContainer}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle()]}>
                Answer
              </Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <Controller
              control={control}
              name="answer"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Provide a detailed, comprehensive answer..."
                  value={value}
                  onChangeText={onChange}
                  error={errors.answer?.message}
                  multiline
                  numberOfLines={4}
                  style={[styles.textArea, styles.answerTextArea]}
                />
              )}
            />

            <View style={styles.labelContainer}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle()]}>
                Category
              </Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="e.g., Medication Safety, Cardiac, Respiratory"
                  value={value}
                  onChangeText={onChange}
                  error={errors.category?.message}
                />
              )}
            />

            <View style={styles.labelContainer}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle()]}>
                Difficulty Level
              </Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <Controller
              control={control}
              name="difficulty"
              render={() => (
                <View style={styles.difficultyContainer}>
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      activeOpacity={0.7}
                      onPress={() => handleDifficultySelect(level)}
                      style={[
                        styles.difficultyButton,
                        dynamicStyles.difficultyButton(
                          selectedDifficulty === level
                        ),
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          dynamicStyles.difficultyText(
                            selectedDifficulty === level
                          ),
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.difficulty && (
              <Text style={styles.errorText}>{errors.difficulty.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <Button
            title={mode === 'edit' ? 'Update Flashcard' : 'Create Flashcard'}
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
            disabled={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};
