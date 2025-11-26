import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Calendar as CalendarIcon, ListChecks } from 'lucide-react-native';
import { GradientBackground, Button, TextInput } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { studyPlanService } from '@services/openai/studyPlan';
import { firestoreService } from '@services/firebase';
import type { StudyPlanInput } from '@services/openai/studyPlan';
import type { StudyPlanStackParamList } from '@navigation/types';
import { Spacing, Typography } from '@theme';

type StudyPlanGeneratorNav = StackNavigationProp<
  StudyPlanStackParamList,
  'StudyPlanGenerator'
>;

export const StudyPlanGeneratorScreen: React.FC = () => {
  const navigation = useNavigation<StudyPlanGeneratorNav>();
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const [studyDuration, setStudyDuration] = useState('30');
  const [dailyHours, setDailyHours] = useState('2');
  const [weakAreas, setWeakAreas] = useState('pharmacology, cardiac');
  const [examDate, setExamDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to create a study plan.');
      return;
    }

    const durationNum = Number(studyDuration);
    const hoursNum = Number(dailyHours);

    if (!durationNum || durationNum <= 0) {
      Alert.alert('Invalid input', 'Please enter a valid study duration.');
      return;
    }

    if (!hoursNum || hoursNum <= 0) {
      Alert.alert('Invalid input', 'Please enter valid daily study hours.');
      return;
    }

    const weakAreasList = weakAreas
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    if (weakAreasList.length === 0) {
      Alert.alert(
        'Add topics',
        'Please enter at least one weak area or topic to focus on.',
      );
      return;
    }

    const input: StudyPlanInput = {
      studyDuration: durationNum,
      dailyHours: hoursNum,
      weakAreas: weakAreasList,
      examDate: examDate || new Date().toISOString().split('T')[0],
    };

    try {
      setIsGenerating(true);
      
      console.log('Step 1: Generating study plan...');
      const generated = await studyPlanService.generateStudyPlan(input);
      console.log('Step 2: Got generated plan:', generated);

      // The service now always returns a normalized StudyPlan with dailyPlan array
      const dailyPlan = generated.dailyPlan.map(task => ({
        ...task,
        isCompleted: Boolean(task.isCompleted || false),
      }));
      
      console.log('Step 3: Mapped dailyPlan, count:', dailyPlan.length);

      const payload = {
        title: `NCLEX plan (${durationNum} days)`,
        examDate: input.examDate,
        studyDuration: durationNum,
        dailyHours: hoursNum,
        weakAreas: weakAreasList,
        status: 'active',
        dailyPlan,
        topicBreakdown: generated.topicBreakdown || {},
        expectedProgress: generated.expectedProgress || `${durationNum}-day NCLEX study plan`,
        completedTaskCount: 0,
        totalTaskCount: dailyPlan.length,
      };
      
      console.log('Step 4: Saving to Firestore...');
      const planId = await firestoreService.createStudyPlan(user.uid, payload);
      console.log('Step 5: Saved successfully, planId:', planId);

      navigation.navigate('StudyPlanDetail', { planId });
    } catch (error: any) {
      console.error('Failed at some step:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      Alert.alert(
        'Error',
        error?.message || 'We could not generate a study plan. Please try again in a moment.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <ListChecks size={28} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Create your NCLEX study plan
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Tell TutorRx about your exam timeline and weak areas. We’ll build
              a day‑by‑day plan for you.
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Study duration (days)"
              keyboardType="number-pad"
              value={studyDuration}
              onChangeText={setStudyDuration}
            />
            <TextInput
              label="Daily study hours"
              keyboardType="decimal-pad"
              value={dailyHours}
              onChangeText={setDailyHours}
            />
            <TextInput
              label="Weak areas / topics"
              value={weakAreas}
              onChangeText={setWeakAreas}
              multiline
            />
            <TextInput
              label="Exam date (YYYY-MM-DD)"
              value={examDate}
              onChangeText={setExamDate}
              rightIcon={<CalendarIcon size={18} color={colors.textSecondary} />}
            />
          </View>

          <Button
            title={isGenerating ? 'Generating plan...' : 'Generate Study Plan'}
            onPress={handleGenerate}
            disabled={isGenerating}
            fullWidth
            size="lg"
            variant="primary"
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.regular,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  button: {
    marginTop: Spacing.md,
  },
});


