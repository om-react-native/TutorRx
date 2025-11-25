import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { useTheme } from '@hooks/useTheme';
import { HomeScreen } from '@screens/Home';
import { ProfileScreen } from '@screens/Profile';
import { CustomTabBar } from '@components/common';
// Placeholder screens - will be created
// import { ChatScreen } from '@screens/Chat/ChatScreen';
// import { QuestionScreen } from '@screens/Questions/QuestionScreen';
// import { FlashcardScreen } from '@screens/Flashcards/FlashcardScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder components
import { View, Text, StyleSheet } from 'react-native';
import { GradientBackground } from '@components/common';

const PlaceholderScreen = ({ name }: { name: string }) => {
  const { colors } = useTheme();
  return (
    <GradientBackground>
      <View style={styles.placeholderContainer}>
        <Text style={[styles.placeholderText, { color: colors.text }]}>
          {name} Screen - Coming Soon
        </Text>
      </View>
    </GradientBackground>
  );
};

const ChatScreen = () => <PlaceholderScreen name="Chat" />;
const QuestionsScreen = () => <PlaceholderScreen name="Questions" />;
const FlashcardsScreen = () => <PlaceholderScreen name="Flashcards" />;

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
  },
});

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
      <Tab.Screen name="Questions" component={QuestionsScreen} />
      <Tab.Screen name="Flashcards" component={FlashcardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
