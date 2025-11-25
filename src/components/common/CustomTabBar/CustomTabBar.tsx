import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Home,
  MessageCircle,
  HelpCircle,
  BookOpen,
  User,
} from 'lucide-react-native';
import { useTheme } from '@hooks/useTheme';
import { Typography, Spacing } from '@theme';

const iconMap = {
  Home: Home,
  Chat: MessageCircle,
  Questions: HelpCircle,
  Flashcards: BookOpen,
  Profile: User,
};

const labelMap = {
  Home: 'Home',
  Chat: 'Chat',
  Questions: 'Q&A',
  Flashcards: 'Flashcards',
  Profile: 'Profile',
};

const useTabBarStyles = () => {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      tabBar: {
        backgroundColor: isDark
          ? 'rgba(26, 31, 46, 0.3)'
          : 'rgba(255, 255, 255, 0.15)',
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(255, 255, 255, 0.5)',
      } as ViewStyle,
      tabLabel: (isFocused: boolean): TextStyle => ({
        color: isFocused ? colors.primary : colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
      }),
      iconColor: (isFocused: boolean) => ({
        color: isFocused ? colors.primary : colors.textSecondary,
      }),
    }),
    [colors, isDark],
  );
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  const dynamicStyles = useTabBarStyles();

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType={isDark ? 'dark' : 'light'}
        blurAmount={20}
        reducedTransparencyFallbackColor="transparent"
      >
        <View style={[styles.tabBar, dynamicStyles.tabBar]}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              labelMap[route.name as keyof typeof labelMap] || route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const IconComponent = iconMap[route.name as keyof typeof iconMap];
            const shouldFill = isFocused && route.name === 'Home';

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                {IconComponent && (
                  <IconComponent
                    size={24}
                    color={dynamicStyles.iconColor(isFocused).color}
                    fill={shouldFill ? colors.primary : 'transparent'}
                    strokeWidth={isFocused ? 2.5 : 2}
                  />
                )}
                <Text
                  style={[styles.tabLabel, dynamicStyles.tabLabel(isFocused)]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  blurView: {
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 600,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: 72,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    minHeight: 60,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    marginTop: 6,
    fontWeight: Typography.fontWeight.medium as TextStyle['fontWeight'],
  },
});
