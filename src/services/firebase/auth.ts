import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '', // Add your Google Web Client ID
});

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  // Email/Password Authentication
  async signUpWithEmail(data: SignUpData): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        data.email,
        data.password
      );
      
      // Update profile with name
      await userCredential.user.updateProfile({
        displayName: data.name,
      });

      return userCredential;
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    }
  }

  async signInWithEmail(data: SignInData): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await auth().signInWithEmailAndPassword(data.email, data.password);
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Google Sign-In
  async signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error('Failed to get Google ID token');
      }
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      return await auth().signInWithCredential(googleCredential);
    } catch (error: any) {
      throw new Error(error.message || 'Google sign in failed');
    }
  }

  // Apple Sign-In (requires @invertase/react-native-apple-authentication)
  async signInWithApple(): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      // Apple Sign-In implementation would go here
      // Requires: npm install @invertase/react-native-apple-authentication
      throw new Error('Apple Sign-In not yet implemented. Install @invertase/react-native-apple-authentication');
    } catch (error: any) {
      throw new Error(error.message || 'Apple sign in failed');
    }
  }

  // Get current user
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  // Auth state observer
  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void
  ): () => void {
    return auth().onAuthStateChanged(callback);
  }
}

export const authService = new AuthService();

