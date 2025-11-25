import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  User,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Camera,
  Crown,
} from 'lucide-react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { GradientBackground, Loading } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { styles, useStyles } from './ProfileScreen.styles';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();
  const dynamicStyles = useStyles();
  const { user, signOut } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Get user initials from name
  const getUserInitials = (name?: string | null): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await signOut();
              // Navigation will be handled by the auth state listener
            } catch (error: any) {
              setIsLoggingOut(false);
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleUpgradeToPremium = () => {
    navigation.navigate('Premium' as never);
  };

  const handleAccount = () => {
    // Navigate to account settings
    Alert.alert('Account', 'Account settings coming soon!');
  };

  const handleNotifications = () => {
    // Navigate to notifications
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const handleHelp = () => {
    // Navigate to help
    Alert.alert('Help', 'Help center coming soon!');
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handleChooseFromLibrary,
        },
        {
          text: 'Remove Photo',
          onPress: handleRemovePhoto,
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: false,
    });

    handleImageResponse(result);
  };

  const handleChooseFromLibrary = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: false,
    });

    handleImageResponse(result);
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Failed to pick image');
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        setProfileImage(imageUri);
        // TODO: Upload to Firebase Storage and update user profile
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    // TODO: Remove from Firebase Storage and update user profile
    Alert.alert('Success', 'Profile picture removed successfully!');
  };

  if (isLoggingOut) {
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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={handleImagePicker}
            activeOpacity={0.8}
            style={styles.avatarWrapper}
          >
            <View
              style={[styles.avatarContainer, dynamicStyles.avatarContainer()]}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text
                  style={[
                    styles.avatarInitials,
                    dynamicStyles.avatarInitials(),
                  ]}
                >
                  {getUserInitials(user?.name)}
                </Text>
              )}
            </View>
            <View style={[styles.cameraButton, dynamicStyles.cameraButton()]}>
              <Camera size={18} color="#FFFFFF" />
            </View>
            {isPremium && (
              <View
                style={[
                  styles.premiumCrownBadge,
                  dynamicStyles.premiumCrownBadge(),
                ]}
              >
                <Crown size={16} color={colors.premium} fill={colors.premium} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.userName, dynamicStyles.userName()]}>
            {user?.name || 'John Doe'}
          </Text>
          <Text style={[styles.userEmail, dynamicStyles.userEmail()]}>
            {user?.email || 'johndoe@example.com'}
          </Text>
        </View>

        {/* Main Profile Card */}
        <View style={[styles.profileCard, dynamicStyles.profileCard()]}>
          {/* Premium Section */}
          <TouchableOpacity
            onPress={handleUpgradeToPremium}
            activeOpacity={0.7}
            style={styles.premiumSection}
          >
            <View style={styles.premiumLeft}>
              <Text style={[styles.premiumTitle, dynamicStyles.premiumTitle()]}>
                {isPremium ? 'Premium' : 'Premium'}
              </Text>
              <Text
                style={[
                  styles.premiumSubtitle,
                  dynamicStyles.premiumSubtitle(),
                ]}
              >
                {isPremium ? 'Active Subscription' : 'Manage Subscription'}
              </Text>
            </View>
            <ChevronRight
              size={24}
              color={isDark ? 'rgba(255, 255, 255, 0.5)' : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Theme Toggle */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconContainer,
                  dynamicStyles.menuIconContainer(),
                ]}
              >
                {isDark ? (
                  <Moon size={22} color={isDark ? '#FFFFFF' : colors.text} />
                ) : (
                  <Sun size={22} color={isDark ? '#FFFFFF' : colors.text} />
                )}
              </View>
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText()]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.8}
              style={[
                styles.themeToggleButton,
                dynamicStyles.themeToggleButton(),
              ]}
            >
              <View style={styles.themeToggleCircle} />
            </TouchableOpacity>
          </View>

          {/* Account */}
          <TouchableOpacity
            onPress={handleAccount}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconContainer,
                  dynamicStyles.menuIconContainer(),
                ]}
              >
                <User size={22} color={isDark ? '#FFFFFF' : colors.text} />
              </View>
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText()]}>
                Account
              </Text>
            </View>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={handleNotifications}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconContainer,
                  dynamicStyles.menuIconContainer(),
                ]}
              >
                <Bell size={22} color={isDark ? '#FFFFFF' : colors.text} />
              </View>
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText()]}>
                Notifications
              </Text>
            </View>
          </TouchableOpacity>

          {/* Help */}
          <TouchableOpacity
            onPress={handleHelp}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconContainer,
                  dynamicStyles.menuIconContainer(),
                ]}
              >
                <HelpCircle
                  size={22}
                  color={isDark ? '#FFFFFF' : colors.text}
                />
              </View>
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText()]}>
                Help
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconContainer,
                  dynamicStyles.menuIconContainer(),
                ]}
              >
                <LogOut size={22} color="#EF4444" />
              </View>
              <Text style={[styles.menuItemText, dynamicStyles.logoutText()]}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, dynamicStyles.versionText()]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </GradientBackground>
  );
};
