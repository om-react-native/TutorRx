import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@constants/openai';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class TutorService {
  private systemPrompt = `You are an expert nursing tutor helping students prepare for the NCLEX exam. 
Provide clear, evidence-based explanations. Use step-by-step reasoning and reference NCLEX guidelines when appropriate.
Be supportive, encouraging, and educational. Keep responses concise but comprehensive.`;

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const message = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      return {
        message,
        usage: usage
          ? {
              prompt_tokens: usage.prompt_tokens,
              completion_tokens: usage.completion_tokens,
              total_tokens: usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get AI response');
    }
  }
}

export const tutorService = new TutorService();

