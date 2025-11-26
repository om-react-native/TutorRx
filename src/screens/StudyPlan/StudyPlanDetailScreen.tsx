import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, ArrowLeft, Trash2, Edit3 } from 'lucide-react-native';
import { GradientBackground, Loading } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { firestoreService } from '@services/firebase';
import type { StudyPlanStackParamList } from '@navigation/types';
import { Spacing, Typography } from '@theme';

type DetailNav = StackNavigationProp<
  StudyPlanStackParamList,
  'StudyPlanDetail'
>;
type DetailRoute = RouteProp<StudyPlanStackParamList, 'StudyPlanDetail'>;

interface LocalTask {
  day: number;
  topics: string[];
  practiceSets: number;
  estimatedHours: number;
  isCompleted: boolean;
}

export const StudyPlanDetailScreen: React.FC = () => {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [planTitle, setPlanTitle] = useState('');
  const [examDate, setExamDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>(
    'active',
  );
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editTaskTopics, setEditTaskTopics] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const planId = route.params.planId;

  const loadPlan = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const doc = await firestoreService.getStudyPlanById(user.uid, planId);
        if (!doc) {
          Alert.alert('Not found', 'Study plan could not be found.');
          navigation.goBack();
          return;
        }

        setPlanTitle(doc.title || 'Study Plan');
        setExamDate(doc.examDate || null);
        setStatus(doc.status || 'active');

        const loadedTasks: LocalTask[] = (doc.dailyPlan || []).map(
          (t: any) => ({
            day: t.day,
            topics: t.topics || [],
            practiceSets: t.practiceSets || 0,
            estimatedHours: t.estimatedHours || 0,
            isCompleted: Boolean(t.isCompleted),
          }),
        );
        setTasks(loadedTasks);
      } catch (error: any) {
        console.error('Failed to load study plan:', error);
        Alert.alert(
          'Error',
          error?.message || 'Failed to load study plan. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadPlan();
  }, [user?.uid, planId, navigation]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [user?.uid, planId])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlan();
    setRefreshing(false);
  }, [user?.uid, planId]);

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleToggleTask = async (index: number) => {
    if (!user?.uid) return;

    try {
      const updated = [...tasks];
      updated[index] = {
        ...updated[index],
        isCompleted: !updated[index].isCompleted,
      };
      setTasks(updated);

      const newCompleted = updated.filter(t => t.isCompleted).length;
      const newStatus = newCompleted === updated.length ? 'completed' : 'active';
      setStatus(newStatus);

      await firestoreService.updateStudyPlanProgress(user.uid, planId, {
        dailyPlan: updated,
        completedTaskCount: newCompleted,
        totalTaskCount: updated.length,
        status: newStatus,
      });
    } catch (error: any) {
      console.error('Failed to update task:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to update task. Please try again.',
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleViewHistory = () => {
    navigation.navigate('StudyPlanHistory');
  };

  const handleDeletePlan = () => {
    Alert.alert(
      'Delete Study Plan',
      'Are you sure you want to delete this study plan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            try {
              await firestoreService.deleteStudyPlan(user.uid, planId);
              Alert.alert('Success', 'Study plan deleted successfully');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to delete plan');
            }
          },
        },
      ],
    );
  };

  const handleEditTask = (index: number) => {
    setEditingTaskIndex(index);
    setEditTaskTopics(tasks[index].topics.join(', '));
  };

  const handleSaveTaskEdit = async () => {
    if (editingTaskIndex === null || !user?.uid) return;

    try {
      const updatedTask = {
        ...tasks[editingTaskIndex],
        topics: editTaskTopics.split(',').map(t => t.trim()).filter(Boolean),
      };

      await firestoreService.updateStudyPlanTask(
        user.uid,
        planId,
        editingTaskIndex,
        updatedTask,
      );

      const updatedTasks = [...tasks];
      updatedTasks[editingTaskIndex] = updatedTask;
      setTasks(updatedTasks);
      setEditingTaskIndex(null);
      setEditTaskTopics('');

      Alert.alert('Success', 'Task updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update task');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading study plan..." />;
  }

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {planTitle}
            </Text>
            {examDate && (
              <Text
                style={[styles.subtitle, { color: colors.textSecondary }]}
              >
                Exam date: {examDate}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Progress
          </Text>
          <Text style={[styles.progressValue, { color: colors.text }]}>
            {completedCount} of {totalCount} tasks ({progressPercent}%)
          </Text>
          <Text style={[styles.status, { color: colors.textSecondary }]}>
            Status: {status === 'completed' ? 'Completed' : 'In progress'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity
              onPress={handleViewHistory}
              style={[styles.historyLink, { flex: 1 }]}
            >
              <Text style={[styles.historyText, { color: colors.primary }]}>
                View all plans
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeletePlan}
              style={[
                styles.deleteButton,
                { backgroundColor: colors.error + '20' },
              ]}
            >
              <Trash2 size={16} color={colors.error} />
              <Text style={[styles.deleteButtonText, { color: colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {tasks.map((task, index) => (
          <View key={index} style={styles.taskRow}>
            <TouchableOpacity
              onPress={() => handleToggleTask(index)}
              style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start' }}
              activeOpacity={0.8}
            >
              <View style={styles.taskIcon}>
                <CheckCircle
                  size={22}
                  color={
                    task.isCompleted ? colors.accent : colors.textSecondary
                  }
                />
              </View>
              <View style={styles.taskTextContainer}>
                {editingTaskIndex === index ? (
                  <TextInput
                    style={[
                      styles.taskEditInput,
                      { color: colors.text, borderColor: colors.primary },
                    ]}
                    value={editTaskTopics}
                    onChangeText={setEditTaskTopics}
                    placeholder="Topics (comma separated)"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                  />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.taskTitle,
                        {
                          color: colors.text,
                          textDecorationLine: task.isCompleted
                            ? 'line-through'
                            : 'none',
                        },
                      ]}
                    >
                      Day {task.day}: {task.topics.join(', ')}
                    </Text>
                    <Text
                      style={[styles.taskMeta, { color: colors.textSecondary }]}
                    >
                      {task.practiceSets} practice sets • {task.estimatedHours}{' '}
                      hours
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {editingTaskIndex === index ? (
              <TouchableOpacity
                onPress={handleSaveTaskEdit}
                style={[
                  styles.editButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>
                  Save
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleEditTask(index)}
                style={[
                  styles.editButton,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Edit3 size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  progressCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  progressValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  status: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
  },
  historyLink: {
    marginTop: Spacing.sm,
  },
  historyText: {
    fontSize: Typography.fontSize.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  taskIcon: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
  },
  taskMeta: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  taskEditInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    minHeight: 60,
  },
});


