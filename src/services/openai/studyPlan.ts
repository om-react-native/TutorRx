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

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content) as StudyPlan;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate study plan');
    }
  }
}

export const studyPlanService = new StudyPlanService();

