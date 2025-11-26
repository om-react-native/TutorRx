import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  MessageCircle,
  FileText,
  Calendar,
  User,
  BookOpen as BookIcon,
  Bot,
  Crown,
} from 'lucide-react-native';
import { GradientBackground } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useHomeData } from '@hooks/useHomeData';
import { useAuthStore } from '@store';
import { styles, useStyles } from './HomeScreen.styles';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const dynamicStyles = useStyles();
  const { user } = useAuthStore();
  const {
    activities,
    loading: activityLoading,
    error: activityError,
    refresh,
  } = useHomeData();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Get user initials from name
  const getUserInitials = (name?: string | null): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isPremium = user?.subscriptionStatus === 'premium';

  const hasChatHistory = activities.some(activity => activity.kind === 'chat');
  const hasStudyPlan = activities.some(
    activity => activity.kind === 'studyPlan',
  );

  const mainFeatures = [
    {
      id: 'ai-chat',
      title: hasChatHistory ? 'Resume AI Chat' : 'Start AI Chat',
      icon: MessageCircle,
      onPress: () => navigation.navigate('Chat' as never),
    },
    {
      id: 'questions',
      title: 'Practice Questions',
      icon: FileText,
      onPress: () => navigation.navigate('Questions' as never),
    },
    {
      id: 'study-plan',
      title: hasStudyPlan ? 'Continue Study Plan' : 'Start Study Plan',
      icon: Calendar,
      onPress: () => {
        // If user has an active study plan, show history to select; otherwise create new
        if (hasStudyPlan) {
          (navigation as any).navigate('StudyPlanStack', {
            screen: 'StudyPlanHistory',
          });
        } else {
          (navigation as any).navigate('StudyPlanStack', {
            screen: 'StudyPlanGenerator',
          });
        }
      },
    },
  ];

  const getActivityIcon = (kind: string) => {
    switch (kind) {
      case 'chat':
        return Bot;
      case 'qa':
        return FileText;
      case 'flashcards':
        return BookIcon;
      case 'studyPlan':
        return Calendar;
      default:
        return BookIcon;
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoContainer, dynamicStyles.logoContainer()]}>
              <Text style={styles.logoText}>+</Text>
            </View>
            <View>
              <Text style={[styles.appName, dynamicStyles.appName()]}>
                TutorRx
              </Text>
              <Text style={[styles.tagline, dynamicStyles.tagline()]}>
                AI-Powered NCLEX Prep
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile' as never)}
            style={styles.profileButtonWrapper}
          >
            <View style={[styles.profileButton, dynamicStyles.profileButton()]}>
              {user?.name ? (
                <Text
                  style={[
                    styles.profileInitials,
                    dynamicStyles.profileInitials(),
                  ]}
                >
                  {getUserInitials(user.name)}
                </Text>
              ) : (
                <User size={20} color={colors.textSecondary} />
              )}
            </View>
            {isPremium && (
              <View style={[styles.crownBadge, dynamicStyles.crownBadge()]}>
                <Crown size={12} color={colors.premium} fill={colors.premium} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Main Feature Buttons */}
        <View style={styles.mainFeaturesContainer}>
          {mainFeatures.map(feature => {
            const IconComponent = feature.icon;
            return (
              <TouchableOpacity
                key={feature.id}
                onPress={feature.onPress}
                activeOpacity={0.7}
                style={[
                  styles.mainFeatureButton,
                  dynamicStyles.mainFeatureButton(),
                ]}
              >
                <View
                  style={[styles.iconContainer, dynamicStyles.iconContainer()]}
                >
                  <IconComponent
                    size={24}
                    color={dynamicStyles.mainFeatureIcon().color}
                  />
                </View>
                <Text
                  style={[
                    styles.mainFeatureText,
                    dynamicStyles.mainFeatureText(),
                  ]}
                >
                  {feature.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Activity Section */}
        <View
          style={[
            styles.recentActivityCard,
            dynamicStyles.recentActivityCard(),
          ]}
        >
          <Text
            style={[
              styles.recentActivityTitle,
              dynamicStyles.recentActivityTitle(),
            ]}
          >
            Recent Activity
          </Text>
          {activityLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 4 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={[
                  styles.activityText,
                  dynamicStyles.activityText(),
                  { marginTop: 8 },
                ]}
              >
                Loading recent activity...
              </Text>
            </View>
          ) : activityError ? (
            <View>
              <Text
                style={[
                  styles.activityText,
                  dynamicStyles.activityText(),
                  { marginBottom: 4 },
                ]}
              >
                Unable to load recent activity.
              </Text>
              <Text style={[styles.activityText, dynamicStyles.activityText()]}>
                Please try again later.
              </Text>
            </View>
          ) : activities.length === 0 ? (
            <View>
              <Text
                style={[
                  styles.activityText,
                  dynamicStyles.activityText(),
                  { marginBottom: 4 },
                ]}
              >
                No recent activity yet.
              </Text>
              <Text style={[styles.activityText, dynamicStyles.activityText()]}>
                Start a chat or ask a question to see it here.
              </Text>
            </View>
          ) : (
            activities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.kind);
              const isLast = index === activities.length - 1;
              return (
                <View
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    isLast && dynamicStyles.activityItemLast(),
                  ]}
                >
                  <View
                    style={[
                      styles.activityIconContainer,
                      dynamicStyles.activityIconContainer(),
                    ]}
                  >
                    <IconComponent
                      size={20}
                      color={dynamicStyles.activityIcon().color}
                    />
                  </View>
                  <Text
                    style={[styles.activityText, dynamicStyles.activityText()]}
                  >
                    {activity.text}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
};
