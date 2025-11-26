import firestore from '@react-native-firebase/firestore';

/**
 * Retry utility for transient Firestore errors
 * Implements exponential backoff for retries
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a transient error that should be retried
      const isTransientError = 
        error.code === 'unavailable' ||
        error.code === 'deadline-exceeded' ||
        error.code === 'internal' ||
        error.message?.includes('unavailable') ||
        error.message?.includes('transient');
      
      // Don't retry if it's not a transient error or we've exhausted retries
      if (!isTransientError || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: wait longer between each retry
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Firestore transient error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

class FirestoreService {
  private db = firestore();

  // User operations
  async createUser(uid: string, userData: any): Promise<void> {
    try {
      // Use retry logic for transient errors
      await retryWithBackoff(async () => {
        // Check if user already exists
        const userDoc = await this.db.collection('users').doc(uid).get();
        if (userDoc.exists()) {
          console.log('User document already exists, skipping creation');
          return;
        }
        
        // Create user document with merge to avoid overwriting if it somehow exists
        await this.db.collection('users').doc(uid).set({
          ...userData,
          createdAt: firestore.FieldValue.serverTimestamp(),
          subscriptionStatus: userData.subscriptionStatus || 'free',
          isAdmin: false, // Default to non-admin
          chatHistory: [],
          flashcardProgress: [],
          studyPlanHistory: [],
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: false }); // Use merge: false to ensure we don't overwrite existing data
      });
    } catch (error: any) {
      // If error is because document already exists, that's okay
      if (error.code === 'already-exists' || error.message?.includes('already exists')) {
        console.log('User document already exists');
        return;
      }
      
      // For unavailable errors, log but don't throw - app can continue without Firestore
      if (error.code === 'unavailable' || error.message?.includes('unavailable')) {
        console.warn('Firestore unavailable - user document will be created when service is available');
        throw new Error('Firestore service is currently unavailable. Please try again later.');
      }
      
      throw new Error(error.message || 'Failed to create user');
    }
  }

  async getUser(uid: string): Promise<any> {
    try {
      // Use a faster retry policy here so auth initialization is snappy
      const doc = await retryWithBackoff(
        async () => {
          return await this.db.collection('users').doc(uid).get();
        },
        1,   // maxRetries: at most one retry
        300, // initialDelay: shorter delay before retry
      );
      return doc.exists() ? { ...doc.data(), id: doc.id } : null;
    } catch (error: any) {
      // For unavailable errors, return null instead of throwing
      // This allows the app to continue with Firebase Auth data
      if (error.code === 'unavailable' || error.message?.includes('unavailable')) {
        console.warn('Firestore unavailable - using Firebase Auth data only');
        return null;
      }
      throw new Error(error.message || 'Failed to get user');
    }
  }

  async updateUser(uid: string, data: any): Promise<void> {
    try {
      await this.db.collection('users').doc(uid).update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
    }
  }

  async updateSubscriptionStatus(uid: string, status: 'free' | 'premium'): Promise<void> {
    try {
      // For a simple “one month” premium, we store a client-computed expiry.
      // This can later be enforced or extended by backend logic if needed.
      let subscriptionExpiresAt: string | null = null;
      if (status === 'premium') {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        subscriptionExpiresAt = expiresAt.toISOString();
      }

      await this.db.collection('users').doc(uid).update({
        subscriptionStatus: status,
        subscriptionUpdatedAt: firestore.FieldValue.serverTimestamp(),
        subscriptionExpiresAt,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update subscription status');
    }
  }

  async getSubscriptionStatus(uid: string): Promise<'free' | 'premium'> {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      const data = doc.data();
      return data?.subscriptionStatus || 'free';
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get subscription status');
    }
  }

  // Chat operations
  async createChat(uid: string, chatData: any): Promise<string> {
    try {
      const chatRef = await this.db
        .collection('users')
        .doc(uid)
        .collection('chats')
        .add({
          ...chatData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      return chatRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create chat');
    }
  }

  async addMessage(uid: string, chatId: string, message: any): Promise<void> {
    try {
      await this.db
        .collection('users')
        .doc(uid)
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          ...message,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add message');
    }
  }

  async getChats(uid: string): Promise<any[]> {
    try {
      const snapshot = await this.db
        .collection('users')
        .doc(uid)
        .collection('chats')
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get chats');
    }
  }

  // Question operations
  async getQuestions(filters?: any): Promise<any[]> {
    try {
      let query: any = this.db.collection('questions');
      
      if (filters?.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters?.difficulty) {
        query = query.where('difficulty', '==', filters.difficulty);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get questions');
    }
  }

  async saveQuestionAttempt(uid: string, attemptData: any): Promise<void> {
    try {
      await this.db
        .collection('users')
        .doc(uid)
        .collection('questionAttempts')
        .add({
          ...attemptData,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save attempt');
    }
  }

  // Study Plan operations
  async saveStudyPlan(uid: string, planData: any): Promise<string> {
    try {
      const planRef = await this.db
        .collection('users')
        .doc(uid)
        .collection('studyPlans')
        .add({
          ...planData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      return planRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save study plan');
    }
  }

  async getStudyPlans(uid: string): Promise<any[]> {
    try {
      const snapshot = await this.db
        .collection('users')
        .doc(uid)
        .collection('studyPlans')
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get study plans');
    }
  }

  // Scenario operations
  async saveScenario(uid: string, scenarioData: any): Promise<string> {
    try {
      const scenarioRef = await this.db
        .collection('users')
        .doc(uid)
        .collection('scenarios')
        .add({
          ...scenarioData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      return scenarioRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save scenario');
    }
  }

  async getScenarios(uid: string): Promise<any[]> {
    try {
      const snapshot = await this.db
        .collection('users')
        .doc(uid)
        .collection('scenarios')
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get scenarios');
    }
  }

  // Flashcard operations
  async createFlashcard(uid: string, flashcardData: any): Promise<string> {
    try {
      const flashcardRef = await this.db
        .collection('flashcards')
        .add({
          ...flashcardData,
          createdBy: uid,
          isActive: true,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      return flashcardRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create flashcard');
    }
  }

  async updateFlashcard(flashcardId: string, flashcardData: any): Promise<void> {
    try {
      await this.db
        .collection('flashcards')
        .doc(flashcardId)
        .update({
          ...flashcardData,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update flashcard');
    }
  }

  async deleteFlashcard(flashcardId: string): Promise<void> {
    try {
      // Soft delete - set isActive to false
      await this.db
        .collection('flashcards')
        .doc(flashcardId)
        .update({
          isActive: false,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete flashcard');
    }
  }

  async getAllFlashcards(): Promise<any[]> {
    try {
      const snapshot = await this.db
        .collection('flashcards')
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get flashcards');
    }
  }

  async getFlashcardById(flashcardId: string): Promise<any> {
    try {
      const doc = await this.db
        .collection('flashcards')
        .doc(flashcardId)
        .get();
      return doc.exists() ? { id: doc.id, ...doc.data() } : null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get flashcard');
    }
  }
}

export const firestoreService = new FirestoreService();

