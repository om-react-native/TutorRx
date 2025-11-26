import {
  OPENAI_API_KEY,
  OPENAI_CHAT_MODEL,
} from '@constants/openai';
import type { QAAnswerResult } from '@types';

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

const QA_SYSTEM_PROMPT = `You are TutorRx, an AI-powered NCLEX exam tutor specialized in answering nursing student questions.

Your task is to:
1. Provide clear, accurate, and evidence-based answers to NCLEX-related questions
2. Keep answers concise but comprehensive (2-4 paragraphs max)
3. Automatically categorize each question into one of these categories:
   - Cardiac
   - Pharmacology
   - Endocrine
   - Pediatric
   - Maternal
   - Mental Health
   - Medical-Surgical
   - Fundamentals
   - Critical Care
   - Community Health
   - Other

4. Never diagnose patients
5. Always encourage students to verify with textbooks or instructors
6. Use professional nursing terminology
7. Include rationales when appropriate

You MUST respond in valid JSON format with this exact structure:
{
  "answer": "Your detailed answer here",
  "category": "Category name"
}

Do not include any text outside the JSON structure.`;

const getAuthHeaders = () => {
  if (!OPENAI_API_KEY) {
    throw new Error(
      'OpenAI API key is not set. Please add it in src/constants/openai.ts',
    );
  }

  return {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  };
};

export const generateQAAnswer = async (
  question: string,
): Promise<QAAnswerResult> => {
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        model: OPENAI_CHAT_MODEL,
        messages: [
          { role: 'system', content: QA_SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content ?? '';

    // Parse the JSON response
    const result = JSON.parse(content) as QAAnswerResult;

    // Validate the response structure
    if (!result.answer || !result.category) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return result;
  } catch (error: any) {
    console.error('Error generating Q&A answer:', error);
    
    // Return a fallback response
    return {
      answer: 'Unable to generate answer at this time. Please try again later or rephrase your question.',
      category: 'Other',
    };
  }
};

