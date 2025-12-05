// OpenAI API configuration
// IMPORTANT: Do NOT hardcode your real key here in production.
// Prefer using environment variables / build-time config and wiring them in.
//
// For local development you can temporarily paste your key here,
// but make sure this file is NOT committed with a real secret.
export const OPENAI_API_KEY = '' ; // TODO: set via env or build config

// Default models used across the app
export const OPENAI_CHAT_MODEL = 'gpt-4o-mini';
export const OPENAI_IMAGE_MODEL = 'dall-e-3';
export const OPENAI_TRANSCRIPTION_MODEL = 'whisper-1';

// TutorRx NCLEX-safe system prompt
export const TUTORRX_SYSTEM_PROMPT = `
You are TutorRx, an AI-powered NCLEX exam tutor.
Your job is to help nursing students learn concepts clearly,
provide step-by-step rationales, explain answers,
and keep explanations safe, accurate, and evidence-based.
Never diagnose.
Always encourage students to verify with textbooks or instructors.
`;


