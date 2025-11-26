import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, ArrowLeft, Trash2, Plus } from 'lucide-react-native';
import { GradientBackground, Loading } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { firestoreService } from '@services/firebase';
import type { StudyPlanStackParamList } from '@navigation/types';
import { Spacing, Typography } from '@theme';

type HistoryNav = StackNavigationProp<
  StudyPlanStackParamList,
  'StudyPlanHistory'
>;

interface HistoryItem {
  id: string;
  title: string;
  createdAt?: Date;
  status?: 'active' | 'completed' | 'archived';
  completedTaskCount?: number;
  totalTaskCount?: number;
}

export const StudyPlanHistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryNav>();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState<HistoryItem[]>([]);

  const loadPlans = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const docs = await firestoreService.getStudyPlans(user.uid);
        const mapped: HistoryItem[] = docs.map((doc: any) => ({
          id: doc.id,
          title: doc.title || 'Study Plan',
          createdAt: doc.createdAt?.toDate?.() || undefined,
          status: doc.status || 'active',
          completedTaskCount: doc.completedTaskCount || 0,
          totalTaskCount: doc.totalTaskCount || 0,
        }));
        setPlans(mapped);
      } catch (error: any) {
        console.error('Failed to load study plans:', error);
        Alert.alert(
          'Error',
          error?.message || 'Failed to load study plans. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadPlans();
  }, [user?.uid]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [user?.uid])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  }, [user?.uid]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOpenPlan = (planId: string) => {
    navigation.navigate('StudyPlanDetail', { planId });
  };

  const handleCreateNewPlan = () => {
    navigation.navigate('StudyPlanGenerator');
  };

  const handleDeletePlan = (planId: string, planTitle: string) => {
    Alert.alert(
      'Delete Study Plan',
      `Are you sure you want to delete "${planTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            try {
              await firestoreService.deleteStudyPlan(user.uid, planId);
              // Refresh the list
              setPlans(plans.filter(p => p.id !== planId));
              Alert.alert('Success', 'Study plan deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to delete plan');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <Loading fullScreen text="Loading your study plans..." />;
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
          <Text style={[styles.title, { color: colors.text }]}>
            Study Plans
          </Text>
        </View>

        {/* Create New Plan Button */}
        <TouchableOpacity
          onPress={handleCreateNewPlan}
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create New Plan</Text>
        </TouchableOpacity>

        {plans.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color={colors.textSecondary} />
            <Text
              style={[styles.emptyTitle, { color: colors.text }]}
            >
              No study plans yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Generate your first plan from the Home screen to see it here.
            </Text>
          </View>
        ) : (
          plans.map(plan => {
            const completed = plan.completedTaskCount || 0;
            const total = plan.totalTaskCount || 0;
            const percent =
              total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <TouchableOpacity
                key={plan.id}
                style={styles.card}
                onPress={() => handleOpenPlan(plan.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text
                    style={[styles.cardTitle, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {plan.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text
                      style={[
                        styles.statusBadge,
                        {
                          color: colors.textInverse,
                          backgroundColor:
                            plan.status === 'completed'
                              ? colors.accent
                              : colors.primary,
                        },
                      ]}
                    >
                      {plan.status === 'completed' ? 'Completed' : 'Active'}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id, plan.title);
                      }}
                      style={[styles.deleteIconButton, { backgroundColor: colors.error + '20' }]}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text
                  style={[
                    styles.cardMeta,
                    { color: colors.textSecondary },
                  ]}
                >
                  {completed} of {total} tasks • {percent}% complete
                </Text>
                {plan.createdAt && (
                  <Text
                    style={[
                      styles.cardMeta,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Created on {plan.createdAt.toLocaleDateString()}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
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
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
  emptyTitle: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  emptySubtitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    maxWidth: 260,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: Typography.fontSize.xs,
  },
  cardMeta: {
    fontSize: Typography.fontSize.sm,
  },
  deleteIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.regular,
  },
});


