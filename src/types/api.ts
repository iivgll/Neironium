// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  next_cursor?: string | null;
}

// Auth types
export interface TelegramAuthPayload {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  photo_url?: string | null;
  auth_date: number;
  hash: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}

// User types
export interface UserRead {
  tg_id: number;
  nickname?: string | null;
  language?: string | null;
  timestamp: string;
  gmt_offset?: number | null;
}

// Project types
export interface ProjectCreate {
  name: string;
  description?: string | null;
}

export interface ProjectUpdate {
  name?: string | null;
  description?: string | null;
}

export interface ProjectRead {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Chat types
export interface ChatCreate {
  title?: string | null;
  system_prompt?: string | null;
  model?: string | null;
  temperature?: number | null;
  project_id?: number | null;
}

export interface ChatUpdate {
  title?: string | null;
  system_prompt?: string | null;
  model?: string | null;
  temperature?: number | null;
  project_id?: number | null;
}

export interface ChatRead {
  id: number;
  project_id?: number | null;
  title?: string | null;
  model?: string | null;
  temperature?: number | null;
  created_at: string;
  updated_at: string;
}

// Message types
export interface MessageCreate {
  content: string;
  client_message_id?: string | null;
}

export interface MessageRead {
  id: number;
  chat_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    thinkingText?: string;
    hasThinkingProcess?: boolean;
    thinkingExpanded?: boolean;
  };
}

// Streaming types
export interface StreamingResponse {
  type: "message" | "error" | "done";
  data?: any;
  error?: string;
}
