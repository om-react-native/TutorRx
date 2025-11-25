export interface Question {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  rationaleCorrect: string;
  rationaleIncorrect: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timestamp: Date;
}

