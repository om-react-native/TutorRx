export type ChatMessageRole = 'user' | 'assistant';

export type ChatMessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'image_answer';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  imageUri?: string;
  audioUri?: string;
  tokensUsed?: number;
  messageType?: ChatMessageType;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
  isArchived?: boolean;
}

