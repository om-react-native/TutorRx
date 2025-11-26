import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Questions: undefined;
  Flashcards: undefined;
  Profile: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: { chatId: string };
  ChatHistory: undefined;
};

export type QuestionsStackParamList = {
  QuestionList: undefined;
  QuestionDetail: { questionId: string };
  Rationale: { questionId: string; selectedAnswer: string };
  QuestionHistory: undefined;
};

export type StudyPlanStackParamList = {
  StudyPlanGenerator: undefined;
  StudyPlanDetail: { planId: string };
  StudyPlanHistory: undefined;
};

export type ScenariosStackParamList = {
  ScenarioGenerator: undefined;
  ScenarioDetail: { scenarioId: string };
  ScenarioHistory: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Premium: undefined;
  SubscriptionManage: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Premium: undefined;
  CreateFlashcard: { mode: 'create' | 'edit'; flashcardId?: string };
  ChatStack: NavigatorScreenParams<ChatStackParamList>;
  QuestionsStack: NavigatorScreenParams<QuestionsStackParamList>;
  StudyPlanStack: NavigatorScreenParams<StudyPlanStackParamList>;
  ScenariosStack: NavigatorScreenParams<ScenariosStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

