import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Crown, CheckCircle, X } from 'lucide-react-native';
import { GradientBackground, Loading } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { subscriptionService } from '@services/stripe';
import { styles, useStyles } from './PremiumScreen.styles';

export const PremiumScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const dynamicStyles = useStyles();
  const { user, setUser, updateSubscriptionStatus } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const features = [
    {
      id: '1',
      title: 'Unlimited AI Chat Sessions',
      description: 'Get instant answers to your NCLEX questions 24/7',
    },
    {
      id: '2',
      title: 'Full Practice Question Bank',
      description: 'Access to 5,000+ NCLEX-style practice questions',
    },
    {
      id: '3',
      title: 'Custom Study Plans',
      description: 'Personalized study schedules based on your goals',
    },
  ];

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);
      if (!user?.uid || !user?.email) {
        Alert.alert('Error', 'Please log in to subscribe');
        return;
      }

      // 1) Run the in-app Stripe PaymentSheet flow
      await subscriptionService.purchaseSubscription(user.uid);

      // 2) Immediately mark user as premium in local auth store
      // so all UIs (Premium, Profile, Home) update right away.
      if (user) {
        setUser({
          ...user,
          subscriptionStatus: 'premium',
        });
      }

      // 3) Fire-and-forget subscription status update (persist to Firestore)
      updateSubscriptionStatus('premium').catch(error => {
        console.warn('Failed to persist premium status:', error);
        Alert.alert(
          'Warning',
          'Your payment succeeded, but we could not save your premium status. Please try again or contact support.',
        );
      });

      Alert.alert(
        'Success',
        'Payment successful! You now have access to TutorRx Premium for one month.',
      );
    } catch (error: any) {
      // Any error from PaymentSheet or setup should stop the loader
      Alert.alert('Error', error.message || 'Failed to process subscription');
    } finally {
      // In case we threw before or during the payment flow, make sure
      // we never leave the screen in a loading state.
      setIsProcessing(false);
    }
  };

  const handleRestorePurchase = async () => {
    try {
      setIsProcessing(true);
      // TODO: Implement restore purchase logic
      Alert.alert('Restore Purchase', 'Checking for existing subscriptions...');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (isProcessing) {
    return <Loading />;
  }

  const isPremium = user?.subscriptionStatus === 'premium';

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.closeButton, dynamicStyles.closeButton()]}
          activeOpacity={0.7}
        >
          <X size={24} color={isDark ? '#FFFFFF' : colors.text} />
        </TouchableOpacity>

        {/* Crown Icon */}
        <View style={[styles.crownContainer, dynamicStyles.crownContainer()]}>
          <Crown size={64} color={colors.premium} strokeWidth={1.5} />
        </View>

        {/* Title */}
        <Text style={[styles.title, dynamicStyles.title()]}>Get TutorRx</Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, dynamicStyles.subtitle()]}>
          Unlock all features
        </Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View
              key={feature.id}
              style={[
                styles.featureItem,
                index === features.length - 1 && styles.featureItemLast,
              ]}
            >
              <View
                style={[
                  styles.checkIconContainer,
                  dynamicStyles.checkIconContainer(),
                ]}
              >
                <CheckCircle
                  size={28}
                  color={isDark ? '#FFFFFF' : colors.text}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.featureTextContainer}>
                <Text
                  style={[styles.featureTitle, dynamicStyles.featureTitle()]}
                >
                  {feature.title}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Subscribe Button */}
        {!isPremium && (
          <TouchableOpacity
            onPress={handleSubscribe}
            activeOpacity={0.8}
            style={[styles.subscribeButton, dynamicStyles.subscribeButton()]}
          >
            <Text
              style={[
                styles.subscribeButtonText,
                dynamicStyles.subscribeButtonText(),
              ]}
            >
              Subscribe for $19.99/month
            </Text>
          </TouchableOpacity>
        )}

        {/* Already Premium */}
        {isPremium && (
          <View style={[styles.premiumBadge, dynamicStyles.premiumBadge()]}>
            <Crown size={20} color={colors.premium} />
            <Text style={[styles.premiumText, dynamicStyles.premiumText()]}>
              You're Premium!
            </Text>
          </View>
        )}

        {/* Restore Purchase */}
        <TouchableOpacity
          onPress={handleRestorePurchase}
          activeOpacity={0.7}
          style={styles.restoreButton}
        >
          <Text
            style={[
              styles.restoreButtonText,
              dynamicStyles.restoreButtonText(),
            ]}
          >
            Restore Purchase
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={[styles.termsText, dynamicStyles.termsText()]}>
          Auto-renewable. Cancel anytime in Settings.
        </Text>
      </ScrollView>
    </GradientBackground>
  );
};
