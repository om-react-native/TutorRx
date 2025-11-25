import firestore from '@react-native-firebase/firestore';

class FirestoreService {
  private db = firestore();

  // User operations
  async createUser(uid: string, userData: any): Promise<void> {
    try {
      await this.db.collection('users').doc(uid).set({
        ...userData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        subscriptionStatus: 'free',
        chatHistory: [],
        flashcardProgress: [],
        studyPlanHistory: [],
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create user');
    }
  }

  async getUser(uid: string): Promise<any> {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      return doc.exists ? { ...doc.data(), id: doc.id } : null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user');
    }
  }

  async updateUser(uid: string, data: any): Promise<void> {
    try {
      await this.db.collection('users').doc(uid).update(data);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
    }
  }

  async updateSubscriptionStatus(uid: string, status: 'free' | 'premium'): Promise<void> {
    try {
      await this.db.collection('users').doc(uid).update({
        subscriptionStatus: status,
        subscriptionUpdatedAt: firestore.FieldValue.serverTimestamp(),
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
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
}

export const firestoreService = new FirestoreService();

