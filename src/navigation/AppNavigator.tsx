import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { StudyPlanNavigator } from './StudyPlanNavigator';
import { PremiumScreen } from '@screens/Premium';
import { ChatHistoryScreen } from '@screens/Chat';
import { CreateFlashcardScreen } from '@screens/Flashcards/CreateFlashcardScreen';
import { useAuthStore } from '@store/authStore';
import type { RootStackParamList } from './types';
import { Loading } from '@components/common';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, isLoading, isInitialized } = useAuthStore();
  const hasShownExpiryAlert = useRef(false);

  // Simple in-app notification when a premium subscription is close to expiring.
  useEffect(() => {
    if (
      user &&
      user.subscriptionStatus === 'premium' &&
      user.subscriptionExpiresAt &&
      !hasShownExpiryAlert.current
    ) {
      const now = new Date();
      const expiresAt = new Date(user.subscriptionExpiresAt);
      const msUntilExpiry = expiresAt.getTime() - now.getTime();
      const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);

      // Show a reminder when the subscription is within 3 days of expiring.
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) {
        hasShownExpiryAlert.current = true;
        Alert.alert(
          'Subscription expiring soon',
          `Your premium access will expire on ${expiresAt.toLocaleDateString()}.`,
        );
      }
    }
  }, [user]);

  // Show loading screen while checking auth state
  if (!isInitialized || isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  return (
    <NavigationContainer
      onReady={() => {
        // Navigation is ready - auth state has been initialized
        // This ensures user data is loaded before navigation renders
        console.log(
          'Navigation ready, user:',
          user ? user.email : 'not logged in',
        );
      }}
      onStateChange={_state => {
        // Optional: Track navigation state changes for analytics
        // You can add analytics tracking here if needed
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="StudyPlanStack"
              component={StudyPlanNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Premium"
              component={PremiumScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
            <Stack.Screen
              name="ChatHistory"
              component={ChatHistoryScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CreateFlashcard"
              component={CreateFlashcardScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
