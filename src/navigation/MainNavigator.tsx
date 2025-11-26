import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { HomeScreen } from '@screens/Home';
import { ProfileScreen } from '@screens/Profile';
import { ChatScreen } from '@screens/Chat';
import { FlashcardsScreen } from '@screens/Flashcards';
import { QAScreen } from '@screens/Questions';
import { CustomTabBar } from '@components/common';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderTabBar = (props: any) => <CustomTabBar {...props} />;

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Questions" component={QAScreen} />
      <Tab.Screen name="Flashcards" component={FlashcardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
