import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@constants/openai';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export interface ClinicalScenario {
  patientHistory: string;
  symptoms: string[];
  vitals: Record<string, string>;
  labs: Record<string, string>;
  nursingDiagnoses: string[];
  interventions: string[];
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

class ScenarioService {
  async generateScenario(topic?: string): Promise<ClinicalScenario> {
    try {
      const prompt = topic
        ? `Generate a detailed clinical scenario for NCLEX preparation focused on ${topic}.`
        : 'Generate a detailed clinical scenario for NCLEX preparation covering a common nursing situation.';

      const fullPrompt = `${prompt}

Include:
- Patient history
- Current symptoms
- Vital signs
- Lab results
- Nursing diagnoses
- Nursing interventions
- Multiple choice questions with explanations

Format the response as JSON.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert nursing educator. Generate realistic clinical scenarios in JSON format for NCLEX preparation.',
          },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content) as ClinicalScenario;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate scenario');
    }
  }
}

export const scenarioService = new ScenarioService();

