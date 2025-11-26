export type StudyPlanStatus = 'active' | 'completed' | 'archived';

export interface StudyPlanTask {
  day: number;
  topics: string[];
  practiceSets: number;
  estimatedHours: number;
  isCompleted: boolean;
}

export interface StudyPlanDocument {
  id: string;
  title: string;
  examDate: string;
  studyDuration: number;
  dailyHours: number;
  weakAreas: string[];
  status: StudyPlanStatus;
  createdAt: Date;
  updatedAt?: Date;
  dailyPlan: StudyPlanTask[];
  topicBreakdown: Record<string, number>;
  expectedProgress: string;
  completedTaskCount: number;
  totalTaskCount: number;
}


