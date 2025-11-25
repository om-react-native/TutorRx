import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MessageCircle,
  FileText,
  BookOpen,
  Calendar,
  User,
  BookOpen as BookIcon,
  Bot,
  Crown,
} from 'lucide-react-native';
import { GradientBackground } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { styles, useStyles } from './HomeScreen.styles';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const dynamicStyles = useStyles();
  const { user } = useAuthStore();

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

  const mainFeatures = [
    {
      id: 'ai-chat',
      title: 'Start AI Chat',
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
      id: isDark ? 'study-plan' : 'flashcards',
      title: isDark ? 'Study Plan' : 'Flashcards',
      icon: isDark ? Calendar : BookOpen,
      onPress: () =>
        navigation.navigate((isDark ? 'StudyPlan' : 'Flashcards') as never),
    },
  ];

  const recentActivities = [
    {
      id: '1',
      text: 'Answered 5 NCLEX Questions today',
      icon: BookIcon,
    },
    {
      id: '2',
      text: 'AI Chat Session about Cardiac',
      icon: Bot,
    },
  ];

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
          {recentActivities.map((activity, index) => {
            const IconComponent = activity.icon;
            const isLast = index === recentActivities.length - 1;
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
          })}
        </View>
      </ScrollView>
    </GradientBackground>
  );
};
