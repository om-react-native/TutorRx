import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { PremiumScreen } from '@screens/Premium';
import { authService } from '@services/firebase';
import type { RootStackParamList } from './types';
import { Loading } from '@components/common';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        screenListeners={{
          state: (e) => {
            // Optional: Track navigation state changes
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="Premium"
              component={PremiumScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
                gestureDirection: 'vertical',
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

