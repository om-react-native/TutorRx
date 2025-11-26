import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { StudyPlanStackParamList } from './types';
import {
  StudyPlanGeneratorScreen,
  StudyPlanDetailScreen,
  StudyPlanHistoryScreen,
} from '@screens/StudyPlan';

const Stack = createStackNavigator<StudyPlanStackParamList>();

export const StudyPlanNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="StudyPlanGenerator"
        component={StudyPlanGeneratorScreen}
      />
      <Stack.Screen
        name="StudyPlanDetail"
        component={StudyPlanDetailScreen}
      />
      <Stack.Screen
        name="StudyPlanHistory"
        component={StudyPlanHistoryScreen}
      />
    </Stack.Navigator>
  );
};


