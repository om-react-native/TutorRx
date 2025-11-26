export interface QAQuestion {
  id: string;
  questionText: string;
  answer: string;
  category?: string;
  userId: string;
  userName: string;
  likes: number;
  createdAt: Date;
  isLikedByCurrentUser?: boolean;
}

export interface CreateQAQuestionData {
  questionText: string;
  userId: string;
  userName: string;
}

export interface QAAnswerResult {
  answer: string;
  category: string;
}

