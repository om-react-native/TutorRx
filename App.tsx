/**
 * TutorRx - AI Nursing Tutor Mobile App
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from '@navigation';
import { initializeStripe } from '@services/stripe';
import { useAuthStore } from '@store/authStore';

// Initialize Stripe
initializeStripe();

function App() {
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  useEffect(() => {
    // Initialize Firebase Auth state listener
    // This will automatically restore user session on app restart
    const unsubscribe = initializeAuth();

    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor="transparent"
          translucent
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
