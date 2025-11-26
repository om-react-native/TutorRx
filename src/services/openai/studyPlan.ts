import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@constants/openai';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export interface StudyPlanInput {
  studyDuration: number; // days
  weakAreas: string[];
  dailyHours: number;
  examDate: string;
}

export interface StudyPlan {
  dailyPlan: Array<{
    day: number;
    topics: string[];
    practiceSets: number;
    estimatedHours: number;
  }>;
  topicBreakdown: Record<string, number>; // topic -> hours
  expectedProgress: string;
}

const buildFallbackStudyPlan = (input: StudyPlanInput): StudyPlan => {
  const days = Math.max(1, Math.round(input.studyDuration));
  const dailyHours = Math.max(1, Math.round(input.dailyHours));
  const topics =
    input.weakAreas && input.weakAreas.length > 0
      ? input.weakAreas
      : ['NCLEX fundamentals'];

  const dailyPlan = Array.from({ length: days }, (_, index) => {
    const topic = topics[index % topics.length];
    return {
      day: index + 1,
      topics: [topic],
      practiceSets: 2,
      estimatedHours: dailyHours,
    };
  });

  const topicBreakdown: Record<string, number> = {};
  dailyPlan.forEach(entry => {
    entry.topics.forEach(t => {
      topicBreakdown[t] = (topicBreakdown[t] || 0) + entry.estimatedHours;
    });
  });

  const expectedProgress = `Over ${days} days you will focus on ${topics.join(
    ', ',
  )} for about ${dailyHours} hours per day.`;

  return {
    dailyPlan,
    topicBreakdown,
    expectedProgress,
  };
};

class StudyPlanService {
  async generateStudyPlan(input: StudyPlanInput): Promise<StudyPlan> {
    try {
      const prompt = `Create a detailed NCLEX study plan for a nursing student with the following requirements:
- Study duration: ${input.studyDuration} days
- Weak areas: ${input.weakAreas.join(', ')}
- Daily study hours: ${input.dailyHours} hours
- Exam date: ${input.examDate}

Provide a structured daily plan with topics, practice sets, and estimated hours. Include a topic breakdown and expected progress milestones.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert NCLEX study plan generator. Create detailed, structured study plans in JSON format.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '';

      if (!content) {
        console.warn(
          'Study plan generation returned empty content. Using fallback plan.',
        );
        return buildFallbackStudyPlan(input);
      }

      try {
        const parsed = JSON.parse(content) as any;
        
        // Try to normalize various possible structures
        let dailyPlan: any[] = [];
        
        if (parsed.dailyPlan && Array.isArray(parsed.dailyPlan)) {
          dailyPlan = parsed.dailyPlan;
        } else if (parsed.daily_plan && Array.isArray(parsed.daily_plan)) {
          dailyPlan = parsed.daily_plan;
        } else if (parsed.studyPlan?.topics) {
          // Handle nested structure from OpenAI
          const topics = parsed.studyPlan.topics;
          Object.values(topics).forEach((week: any) => {
            if (week && typeof week === 'object') {
              Object.values(week).forEach((topic: any) => {
                if (topic?.days && Array.isArray(topic.days)) {
                  dailyPlan.push(...topic.days);
                }
              });
            }
          });
        }
        
        if (dailyPlan.length > 0) {
          return {
            dailyPlan,
            topicBreakdown: parsed.topicBreakdown || parsed.studyPlan?.topicBreakdown || {},
            expectedProgress: parsed.expectedProgress || parsed.studyPlan?.expectedProgress || `${input.studyDuration}-day study plan`,
          };
        }
        
        console.warn('Parsed JSON but no dailyPlan found. Using fallback.');
        return buildFallbackStudyPlan(input);
      } catch (parseError) {
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const sliced = content.slice(firstBrace, lastBrace + 1);
          try {
            const parsed = JSON.parse(sliced) as any;
            
            let dailyPlan: any[] = [];
            if (parsed.dailyPlan && Array.isArray(parsed.dailyPlan)) {
              dailyPlan = parsed.dailyPlan;
            } else if (parsed.studyPlan?.topics) {
              const topics = parsed.studyPlan.topics;
              Object.values(topics).forEach((week: any) => {
                if (week && typeof week === 'object') {
                  Object.values(week).forEach((topic: any) => {
                    if (topic?.days && Array.isArray(topic.days)) {
                      dailyPlan.push(...topic.days);
                    }
                  });
                }
              });
            }
            
            if (dailyPlan.length > 0) {
              return {
                dailyPlan,
                topicBreakdown: parsed.topicBreakdown || {},
                expectedProgress: parsed.expectedProgress || `${input.studyDuration}-day study plan`,
              };
            }
          } catch (innerError) {
            console.warn('Failed to parse sliced JSON. Using fallback.', innerError);
          }
        }

        console.warn('JSON parse failed, using fallback plan.');
        return buildFallbackStudyPlan(input);
      }
    } catch (error: any) {
      // Any error from OpenAI should not break the app - use a deterministic fallback plan
      console.warn('Study plan generation failed, using fallback plan:', error);
      return buildFallbackStudyPlan(input);
    }
  }
}

export const studyPlanService = new StudyPlanService();

