import { useEffect, useState, useCallback } from 'react';
import { firestoreService } from '@services/firebase';
import { useAuthStore } from '@store';
import type { HomeActivity } from '@types';

interface UseHomeDataResult {
  activities: HomeActivity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useHomeData = (): UseHomeDataResult => {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<HomeActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
      if (!user?.uid) {
        setActivities([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [chatsResult, qaResult, studyPlansResult, flashcardsResult] =
          await Promise.allSettled([
            firestoreService.getChats(user.uid),
            firestoreService.getQAQuestions(10),
            firestoreService.getStudyPlans(user.uid),
            firestoreService.getAllFlashcards(),
          ]);

        const merged: HomeActivity[] = [];

        if (chatsResult.status === 'fulfilled') {
          chatsResult.value.slice(0, 3).forEach((chat: any) => {
            const ts = chat.updatedAt || chat.createdAt;
            const date =
              ts?.toDate?.() != null
                ? ts.toDate()
                : ts
                ? new Date(ts)
                : new Date();

            merged.push({
              id: `chat-${chat.id}`,
              kind: 'chat',
              text:
                chat.title ||
                chat.lastMessage ||
                'AI chat study session',
              timestamp: date,
            });
          });
        }

        if (qaResult.status === 'fulfilled') {
          const myQuestions = qaResult.value.questions
            .filter((q: any) => q.userId === user.uid)
            .slice(0, 3);

          myQuestions.forEach((q: any) => {
            const ts = q.createdAt;
            const date =
              ts?.toDate?.() != null
                ? ts.toDate()
                : ts
                ? new Date(ts)
                : new Date();

            merged.push({
              id: `qa-${q.id}`,
              kind: 'qa',
              text: `Asked: ${q.questionText}`,
              timestamp: date,
            });
          });
        }

        if (studyPlansResult.status === 'fulfilled') {
          studyPlansResult.value.slice(0, 2).forEach((plan: any) => {
            const ts = plan.createdAt;
            const date =
              ts?.toDate?.() != null
                ? ts.toDate()
                : ts
                ? new Date(ts)
                : new Date();

            merged.push({
              id: `studyPlan-${plan.id}`,
              kind: 'studyPlan',
              text: plan.title
                ? `Study plan: ${plan.title}`
                : 'Created a study plan',
              timestamp: date,
            });
          });
        }

        if (flashcardsResult.status === 'fulfilled') {
          const myFlashcards = flashcardsResult.value
            .filter((f: any) => f.createdBy === user.uid)
            .slice(0, 3);

          myFlashcards.forEach((f: any) => {
            const ts = f.updatedAt || f.createdAt;
            const date =
              ts?.toDate?.() != null
                ? ts.toDate()
                : ts
                ? new Date(ts)
                : new Date();

            merged.push({
              id: `flashcard-${f.id}`,
              kind: 'flashcards',
              text: f.question
                ? `Flashcard: ${f.question}`
                : 'Created a flashcard',
              timestamp: date,
            });
          });
        }

        merged.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
        );

        setActivities(merged.slice(0, 5));
      } catch (e: any) {
        console.error('Failed to load home data', e);
        setError(e?.message ?? 'Failed to load home data');
      } finally {
        setLoading(false);
      }
    }, [user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { activities, loading, error, refresh };
};


