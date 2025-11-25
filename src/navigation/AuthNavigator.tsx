import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';
import { LoginScreen, SignUpScreen, ForgotPasswordScreen } from '@screens/Auth';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

