import { create } from 'zustand';
import { authService } from '@services/firebase';
import { firestoreService } from '@services/firebase';

interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
  subscriptionStatus: 'free' | 'premium';
  subscriptionExpiresAt?: string | null;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  updateSubscriptionStatus: (status: 'free' | 'premium') => Promise<void>;
  initializeAuth: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  
  setUser: (user) => set({ user }),
  
  /**
   * Initialize Firebase Auth state listener
   * This should be called once when the app starts
   * Returns an unsubscribe function
   * Industry best practice: Use onAuthStateChanged to persist auth state across app restarts
   */
  initializeAuth: () => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Immediately set basic auth-based user so UI can render quickly
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || null,
            photoURL: firebaseUser.photoURL || null,
            subscriptionStatus: 'free',
            subscriptionExpiresAt: null,
            isAdmin: false,
          },
          isLoading: false,
          isInitialized: true,
        });

        // In the background, try to enrich with Firestore user data
        try {
          let userData = await firestoreService.getUser(firebaseUser.uid);

          // If user document doesn't exist in Firestore, create it
          // This handles edge cases where user signed up before Firestore was set up
          if (!userData) {
            console.log('User document not found in Firestore, creating...');
            try {
              await firestoreService.createUser(firebaseUser.uid, {
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || null,
                photoURL: firebaseUser.photoURL || null,
                subscriptionStatus: 'free',
                createdAt: new Date().toISOString(),
              });
              // Fetch again after creation (with retry logic built-in)
              userData = await firestoreService.getUser(firebaseUser.uid);
            } catch (createError: any) {
              // If Firestore is unavailable, log but continue with Auth data
              // The document will be created automatically when Firestore is available
              if (createError.message?.includes('unavailable')) {
                console.warn(
                  'Firestore unavailable - user document will be created when service is available',
                );
              } else {
                console.warn(
                  'Failed to create user document in Firestore:',
                  createError,
                );
              }
              // Continue without Firestore data - app will work with Firebase Auth data
            }
          }

          if (userData) {
            // Update user with Firestore-backed data
            set((current) => ({
              ...current,
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: userData.name || firebaseUser.displayName || null,
                photoURL: userData.photoURL || firebaseUser.photoURL || null,
                subscriptionStatus: userData.subscriptionStatus || 'free',
                subscriptionExpiresAt: userData.subscriptionExpiresAt || null,
                isAdmin: userData.isAdmin || false,
              },
            }));
          }
        } catch (error) {
          // Firestore unavailable - keep using basic Firebase Auth data
          console.warn('Firestore unavailable, using basic auth data:', error);
        }
      } else {
        // User is signed out
        set({ 
          user: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    });
    
    return unsubscribe;
  },
  
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
          // Local copy will be refreshed from Firestore on next auth init,
          // but we keep it simple here and do not try to recompute expiry.
        },
      });
    } catch (error: any) {
      throw error;
    }
  },
  
  signIn: async (email, password) => {
    try {
      set({ isLoading: true });
      const userCredential = await authService.signInWithEmail({ email, password });
      
      // Try to get user data from Firestore, but don't fail if unavailable
      let userData = null;
      try {
        userData = await firestoreService.getUser(userCredential.user.uid);
        
        // If user document doesn't exist, create it (for users who signed up before Firestore was set up)
        if (!userData) {
          console.log('User document not found after sign in, creating...');
          try {
            await firestoreService.createUser(userCredential.user.uid, {
              email: userCredential.user.email || '',
              name: userCredential.user.displayName || null,
              photoURL: userCredential.user.photoURL || null,
              subscriptionStatus: 'free',
              createdAt: new Date().toISOString(),
            });
            userData = await firestoreService.getUser(userCredential.user.uid);
          } catch (createError: any) {
            // If Firestore is unavailable, log but continue - document will be created when available
            if (createError.message?.includes('unavailable')) {
              console.warn('Firestore unavailable - user document will be created when service is available');
            } else {
              console.warn('Failed to create user document after sign in:', createError);
            }
          }
        }
      } catch (firestoreError) {
        console.warn('Firestore unavailable, using basic user data:', firestoreError);
      }
      
      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userData?.name || userCredential.user.displayName || null,
          photoURL: userData?.photoURL || userCredential.user.photoURL || null,
          subscriptionStatus: userData?.subscriptionStatus || 'free',
          subscriptionExpiresAt: userData?.subscriptionExpiresAt || null,
          isAdmin: userData?.isAdmin || false,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  signUp: async (email, password, name) => {
    try {
      set({ isLoading: true });
      const userCredential = await authService.signUpWithEmail({ email, password, name });
      
      // Create user in Firestore with initial data
      // This is critical - user document must be created on signup
      try {
        await firestoreService.createUser(userCredential.user.uid, {
          email,
          name,
          photoURL: null,
          subscriptionStatus: 'free',
          createdAt: new Date().toISOString(),
        });
        console.log('User document created in Firestore successfully');
      } catch (firestoreError: any) {
        // If user already exists, that's okay (idempotent)
        if (firestoreError.message?.includes('already exists') || firestoreError.code === 'already-exists') {
          console.log('User document already exists in Firestore');
        } else if (firestoreError.message?.includes('unavailable')) {
          // Firestore is temporarily unavailable - user is still authenticated
          // Document will be created automatically when Firestore is available
          console.warn('Firestore unavailable during signup - user document will be created when service is available');
        } else {
          console.error('Failed to create user document in Firestore:', firestoreError);
          // Don't throw - user is still authenticated, we can retry later
        }
      }
      
      // Fetch user data from Firestore to ensure consistency
      let userData = null;
      try {
        userData = await firestoreService.getUser(userCredential.user.uid);
      } catch (fetchError) {
        console.warn('Could not fetch user data after signup:', fetchError);
      }
      
      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userData?.name || name,
          photoURL: userData?.photoURL || null,
          subscriptionStatus: userData?.subscriptionStatus || 'free',
          subscriptionExpiresAt: userData?.subscriptionExpiresAt || null,
          isAdmin: userData?.isAdmin || false,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
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
      set({ isLoading: true });
      const userCredential = await authService.signInWithGoogle();
      
      // Try to get/create user data in Firestore, but don't fail if unavailable
      let userData = null;
      try {
        userData = await firestoreService.getUser(userCredential.user.uid);
        if (!userData) {
          // Create new user in Firestore
          console.log('Creating new user document in Firestore for Google sign in');
          try {
            await firestoreService.createUser(userCredential.user.uid, {
              email: userCredential.user.email || '',
              name: userCredential.user.displayName || null,
              photoURL: userCredential.user.photoURL || null,
              subscriptionStatus: 'free',
              createdAt: new Date().toISOString(),
            });
            // Fetch the newly created user data
            userData = await firestoreService.getUser(userCredential.user.uid);
          } catch (createError: any) {
            // If user already exists, that's okay
            if (createError.message?.includes('already exists') || createError.code === 'already-exists') {
              console.log('User document already exists');
              userData = await firestoreService.getUser(userCredential.user.uid);
            } else if (createError.message?.includes('unavailable')) {
              // Firestore is temporarily unavailable - user is still authenticated
              console.warn('Firestore unavailable - user document will be created when service is available');
            } else {
              console.warn('Failed to create user document:', createError);
            }
          }
        }
      } catch (firestoreError) {
        console.warn('Firestore unavailable, using basic user data:', firestoreError);
      }
      
      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userData?.name || userCredential.user.displayName || null,
          photoURL: userData?.photoURL || userCredential.user.photoURL || null,
          subscriptionStatus: userData?.subscriptionStatus || 'free',
          subscriptionExpiresAt: userData?.subscriptionExpiresAt || null,
          isAdmin: userData?.isAdmin || false,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
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

