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

// Sidebar and Project types
export interface Chat {
  id: string;
  title: string;
  isActive?: boolean;
  lastMessage?: string;
  date?: string;
}

export interface Project {
  id: string;
  name: string;
  chats: Chat[];
  isExpanded: boolean;
}

export interface ChatResult {
  id: string;
  title: string;
  lastMessage: string;
  date: string;
  tags?: string[];
}
