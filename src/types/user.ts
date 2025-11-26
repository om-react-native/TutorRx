export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string | null;
  createdAt: Date;
  subscriptionStatus: 'free' | 'premium';
  studyPlanHistory: string[];
  chatHistory: string[];
  flashcardProgress: Record<string, 'easy' | 'hard'>;
  isAdmin?: boolean;
}

