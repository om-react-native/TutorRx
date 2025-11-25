import { StyleSheet } from 'react-native';
import { Spacing } from '@theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
  
  },
  hero: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    
  },
  logo: {
    width: 200,
    height: 200,
    
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
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
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
  },
  backButton: {
    marginTop: Spacing.md,
  },
});

