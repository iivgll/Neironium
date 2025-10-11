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

// Chat types
export interface ChatCreate {
  title?: string | null;
  system_prompt?: string | null;
  model?: string | null;
  temperature?: number | null;
  parent_id?: number | null;
}

export interface ChatUpdate {
  title?: string | null;
  system_prompt?: string | null;
  model?: string | null;
  temperature?: number | null;
  parent_id?: number | null;
}

export interface ChatRead {
  id: number;
  parent_id?: number | null;
  title?: string | null;
  model?: string | null;
  temperature?: number | null;
  created_at: string;
  updated_at: string;
}

// Model types
export interface ModelRead {
  id: string;
  provider: string;
  context_window: string;
  display_name: string;
}

export interface ModelsResponse {
  items: ModelRead[];
}

// Chat tree types
export interface ChatFileInfo {
  id: number;
  name: string;
}

export interface ChatTreeItem {
  id: number;
  parent_id: number | null;
  title: string;
  description: string | null;
  files_count: number;
  files: ChatFileInfo[];
  children: ChatTreeItem[];
}

export interface ChatTreeResponse {
  items: ChatTreeItem[];
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

// File types
export interface FileRead {
  id: number;
  name: string;
  size_bytes: number;
  mime: string;
  chunk_count: number;
  created_at: string;
}

export interface FilesResponse {
  items: FileRead[];
}
