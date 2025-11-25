import {
  OPENAI_API_KEY,
  OPENAI_CHAT_MODEL,
  OPENAI_IMAGE_MODEL,
  OPENAI_TRANSCRIPTION_MODEL,
  TUTORRX_SYSTEM_PROMPT,
} from '@constants/openai';

export interface StreamingChatOptions {
  messages: any[];
  onDelta?: (delta: string) => void;
}

export interface ChatCompletionResult {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

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

export const buildChatMessages = (
  history: { role: 'user' | 'assistant'; content: string }[],
  latestUserContent: string,
): any[] => {
  const trimmedHistory = history.slice(-20);

  return [
    { role: 'system', content: TUTORRX_SYSTEM_PROMPT },
    ...trimmedHistory,
    { role: 'user', content: latestUserContent },
  ];
};

export const chatCompletion = async (
  messages: any[],
): Promise<ChatCompletionResult> => {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI chat error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as any;
  const message = data.choices?.[0]?.message?.content ?? '';
  const usage = data.usage;

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
};

export const streamChatCompletion = async ({
  messages,
  onDelta,
}: StreamingChatOptions): Promise<ChatCompletionResult> => {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 500,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI streaming error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const reader = (response.body as any).getReader
    ? (response.body as any).getReader()
    : null;

  if (!reader) {
    // Fallback: no streaming support, do a normal completion instead
    return chatCompletion(messages);
  }

  const decoder = new TextDecoder('utf-8');
  let fullMessage = '';
  let usage:
    | {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      }
    | undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const dataStr = line.replace(/^data:\s*/, '');
      if (dataStr === '[DONE]') {
        break;
      }

      try {
        const json = JSON.parse(dataStr);
        const delta = json.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          fullMessage += delta;
          if (onDelta) {
            onDelta(delta);
          }
        }

        if (json.usage) {
          usage = {
            prompt_tokens: json.usage.prompt_tokens,
            completion_tokens: json.usage.completion_tokens,
            total_tokens: json.usage.total_tokens,
          };
        }
      } catch {
        // Ignore malformed JSON chunks
      }
    }
  }

  return { message: fullMessage, usage };
};

export const transcribeAudio = async (fileUri: string): Promise<string> => {
  if (!fileUri) {
    return '';
  }

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'audio/m4a',
    name: 'audio.m4a',
  } as any);
  formData.append('model', OPENAI_TRANSCRIPTION_MODEL);

  const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI transcription error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as any;
  return data.text || '';
};

export const generateImage = async (prompt: string): Promise<string> => {
  const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI image generation error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as any;
  const url = data.data?.[0]?.url;
  return url || '';
};


