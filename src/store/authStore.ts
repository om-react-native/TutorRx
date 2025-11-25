import { create } from 'zustand';
import { authService } from '@services/firebase';
import { firestoreService } from '@services/firebase';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface User {
  uid: string;
  email: string | null;
  name: string | null;
  subscriptionStatus: 'free' | 'premium';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateSubscriptionStatus: (status: 'free' | 'premium') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  
  setUser: (user) => set({ user }),
  
  updateSubscriptionStatus: async (status) => {
    try {
      const currentUser = get().user;
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      await firestoreService.updateSubscriptionStatus(currentUser.uid, status);
      set({
        user: {
          ...currentUser,
          subscriptionStatus: status,
        },
      });
    } catch (error: any) {
      throw error;
    }
  },
  
  signIn: async (email, password) => {
    try {
      const userCredential = await authService.signInWithEmail({ email, password });
      
      // Try to get user data from Firestore, but don't fail if unavailable
      let userData = null;
      try {
        userData = await firestoreService.getUser(userCredential.user.uid);
      } catch (firestoreError) {
        console.warn('Firestore unavailable, using basic user data:', firestoreError);
      }
      
      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || userData?.name || null,
          subscriptionStatus: userData?.subscriptionStatus || 'free',
        },
      });
    } catch (error: any) {
      throw error;
    }
  },
  
  signUp: async (email, password, name) => {
    try {
      const userCredential = await authService.signUpWithEmail({ email, password, name });
      
      // Try to create user in Firestore, but don't fail if unavailable
      try {
        await firestoreService.createUser(userCredential.user.uid, {
          email,
          name,
          subscriptionStatus: 'free',
        });
      } catch (firestoreError) {
        console.warn('Firestore unavailable, skipping user creation:', firestoreError);
      }
      
      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name,
          subscriptionStatus: 'free',
        },
      });
    } catch (error: any) {
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      await authService.signOut();
      set({ user: null });
    } catch (error: any) {
      throw error;
    }
  },
  
  signInWithGoogle: async () => {
    try {
      const userCredential = await authService.signInWithGoogle();
      
      // Try to get/create user data in Firestore, but don't fail if unavailable
      let userData = null;
      try {
        userData = await firestoreService.getUser(userCredential.user.uid);
        if (!userData) {
          await firestoreService.createUser(userCredential.user.uid, {
            email: userCredential.user.email,
            name: userCredential.user.displayName,
            subscriptionStatus: 'free',
          });
        }
      } catch (firestoreError) {
        console.warn('Firestore unavailable, using basic user data:', firestoreError);
      }
      
      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || userData?.name || null,
          subscriptionStatus: userData?.subscriptionStatus || 'free',
        },
      });
    } catch (error: any) {
      throw error;
    }
  },
  
  resetPassword: async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
      throw error;
    }
  },
}));

