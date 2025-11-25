import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@store';
import {
  Button,
  TextInput,
  Loading,
  GradientBackground,
} from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { Typography } from '@theme';
import type { AuthStackParamList } from '@navigation/types';
import { styles } from './ForgotPasswordScreen.styles';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { colors } = useTheme();
  const { resetPassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email);
      setIsEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Please check your email for password reset instructions.',
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Sending email..." />;
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontFamily: Typography.fontFamily.regular,
              },
            ]}
          >
            {isEmailSent
              ? 'Check your email for reset instructions'
              : 'Enter your email to reset password'}
          </Text>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {!isEmailSent && (
              <>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      leftIcon={<Mail size={22} color={colors.textSecondary} />}
                    />
                  )}
                />

                <Button
                  title="Send Reset Link"
                  onPress={handleSubmit(onSubmit)}
                  variant="primary"
                  fullWidth
                  size="lg"
                  style={styles.primaryButton}
                />
              </>
            )}

            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              variant="secondary"
              fullWidth
              size="lg"
              style={isEmailSent ? styles.primaryButton : styles.backButton}
              leftIcon={<ArrowLeft size={20} color={colors.text} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};
