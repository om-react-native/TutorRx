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
import { Mail, Lock, User, Apple } from 'lucide-react-native';
import { useAuthStore } from '@store';
import {
  Button,
  TextInput,
  Loading,
  GradientBackground,
  FrostedPanel,
} from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { Typography } from '@theme';
import type { AuthStackParamList } from '@navigation/types';
import { styles } from './SignUpScreen.styles';

type SignUpScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignUp'
>;

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { colors } = useTheme();
  const { signUp, signInWithGoogle } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      await signUp(data.email, data.password, data.name);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up with Google');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Creating account..." />;
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
          <FrostedPanel style={styles.panel}>
            {/* Logo Section */}
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
              Join TutorRx to start learning
            </Text>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Full Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    autoCapitalize="words"
                    leftIcon={<User size={22} color={colors.textSecondary} />}
                  />
                )}
              />

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

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry
                    leftIcon={<Lock size={22} color={colors.textSecondary} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Confirm Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    secureTextEntry
                    leftIcon={<Lock size={22} color={colors.textSecondary} />}
                  />
                )}
              />

              <Button
                title="Sign Up"
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                fullWidth
                size="lg"
                style={styles.primaryButton}
              />

              <View style={styles.footer}>
                <Text
                  style={[
                    styles.footerText,
                    {
                      color: colors.text,
                      fontFamily: Typography.fontFamily.regular,
                    },
                  ]}
                >
                  Already have an account?{' '}
                </Text>
                <Text
                  style={[
                    styles.footerLink,
                    {
                      color: colors.text,
                      fontFamily: Typography.fontFamily.regular,
                    },
                  ]}
                  onPress={() => navigation.navigate('Login')}
                >
                  Sign in
                </Text>
              </View>

              <Button
                title="Continue with Google"
                onPress={handleGoogleSignIn}
                variant="secondary"
                fullWidth
                size="lg"
                style={styles.socialButton}
                leftIcon={
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                }
              />

              <Button
                title="Continue with Apple"
                onPress={() => Alert.alert('Apple Sign In', 'Coming soon')}
                variant="secondary"
                fullWidth
                size="lg"
                style={styles.socialButton}
                leftIcon={<Apple size={20} color={colors.text} />}
              />
            </View>
          </FrostedPanel>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};
