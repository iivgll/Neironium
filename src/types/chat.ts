// Chat-related type definitions
export interface Message {
  id?: number; // Changed from string to number
  chat_id?: number; // Added chat_id field
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string; // Added API timestamp field
  client_message_id?: string; // Added client message id
  timestamp?: Date; // Keep for compatibility
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    thinkingText?: string;
    hasThinkingProcess?: boolean;
    thinkingExpanded?: boolean;
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
  isThinking?: boolean;
  showThinkingProcess?: boolean;
}

export type ChatEventType =
  | "message_sent"
  | "message_received"
  | "error_occurred"
  | "model_changed"
  | "chat_cleared";

export interface ChatEvent {
  type: ChatEventType;
  payload?: unknown;
  timestamp: Date;
}

// Sidebar and Project types
export interface Chat {
  id: number; // Changed from string to number
  title?: string; // Made optional to match API
  project_id?: number | null; // Added project_id field
  model?: string | null; // Added model field
  temperature?: number | null; // Added temperature field
  created_at: string; // Added API timestamp field
  updated_at: string; // Added API timestamp field
  isActive?: boolean; // Keep for UI state
  lastMessage?: string; // Keep for UI state
  date?: string; // Keep for compatibility
}

export interface Project {
  id: number; // Changed from string to number
  name: string;
  description?: string | null; // Added description field
  chats: Chat[];
  isExpanded: boolean; // Keep for UI state
  created_at: string; // Added API timestamp field
  updated_at: string; // Added API timestamp field
}

export interface ChatResult {
  id: number; // Changed from string to number
  title: string;
  lastMessage: string;
  date: string;
  tags?: string[];
}
