import { StyleSheet } from 'react-native';
import { Spacing } from '@theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    
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
    // marginBottom: Spacing.sm,
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
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
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
  primaryButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  socialButton: {
    marginTop: Spacing.md,
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
  googleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E6F2',
  },
  googleIconText: {
    color: '#4285F4',
    fontSize: 15,
    fontWeight: '700',
  },
});

