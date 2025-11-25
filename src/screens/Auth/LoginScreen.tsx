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
import { Mail, Lock } from 'lucide-react-native';
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
import { styles } from './LoginScreen.styles';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { colors } = useTheme();
  const { signIn, signInWithGoogle } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Signing in..." />;
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
              Sign in to continue your NCLEX prep
            </Text>

            <View style={styles.formContainer}>
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

              <Button
                title="Log In"
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                fullWidth
                size="lg"
                style={styles.primaryButton(colors.glassBorder)}
              />

              <Text
                style={[
                  styles.forgotPassword,
                  {
                    color: colors.primary,
                    fontFamily: Typography.fontFamily.regular,
                  },
                ]}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                Forgot Password?
              </Text>

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
                  Don't have an account?{' '}
                </Text>
                <Text
                  style={[
                    styles.footerLink,
                    {
                      color: colors.text,
                      fontFamily: Typography.fontFamily.regular,
                    },
                  ]}
                  onPress={() => navigation.navigate('SignUp')}
                >
                  Sign up
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
                  <Image
                    source={require('@assets/images/google.png')}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                }
              />

              <Button
                title="Continue with Apple"
                onPress={() => Alert.alert('Apple Sign In', 'Coming soon')}
                variant="secondary"
                fullWidth
                size="lg"
                style={styles.socialButton}
                leftIcon={
                  <Image
                    source={require('@assets/images/apple.png')}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                }
              />
            </View>
          </FrostedPanel>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};
