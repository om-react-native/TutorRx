export type HomeActivityKind = 'chat' | 'qa' | 'flashcards' | 'studyPlan';

export interface HomeActivity {
  id: string;
  kind: HomeActivityKind;
  text: string;
  timestamp: Date;
}


