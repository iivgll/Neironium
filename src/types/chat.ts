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

// Sidebar and Chat types
export interface ChatFileInfo {
  id: number;
  name: string;
}

export interface Chat {
  id: number;
  title?: string;
  parent_id?: number | null;
  model?: string | null;
  temperature?: number | null;
  created_at: string;
  updated_at: string;
  isActive?: boolean; // Keep for UI state
  lastMessage?: string; // Keep for UI state
  date?: string; // Keep for compatibility
  children?: Chat[]; // For tree structure
  files_count?: number; // From tree API
  description?: string; // From tree API
  files?: ChatFileInfo[]; // From tree API
}

export interface ChatResult {
  id: number; // Changed from string to number
  title: string;
  lastMessage: string;
  date: string;
  tags?: string[];
}
