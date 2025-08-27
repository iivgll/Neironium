// Chat-related type definitions
export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
}

export interface ChatError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  model: string;
  error?: ChatError | null;
}

export type ChatEventType =
  | 'message_sent'
  | 'message_received'
  | 'error_occurred'
  | 'model_changed'
  | 'chat_cleared';

export interface ChatEvent {
  type: ChatEventType;
  payload?: unknown;
  timestamp: Date;
}
