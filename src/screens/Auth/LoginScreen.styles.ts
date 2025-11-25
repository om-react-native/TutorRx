import { StyleSheet, ViewStyle } from 'react-native';
import { Spacing } from '@theme';

const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    
    gap: Spacing.xl,
    backgroundColor:'transparent'
   
  },
  hero: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    // marginBottom: Spacing.xl,
  },
  logo: {
    width: 200,
    height: 200,
    // marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  panel: {
    width: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  formContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  socialButton: {
    // marginTop: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  forgotPassword: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
});

export const styles = {
  ...staticStyles,
  primaryButton: (borderColor: string): ViewStyle => ({
    // marginTop: Spacing.xl,
    // marginBottom: Spacing.md,
    borderColor: borderColor,
  }),
};

