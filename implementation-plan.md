# Детальный план реализации API интеграции

## Общее описание задачи

### Что нужно сделать

Вам нужно интегрировать существующий фронтенд (Next.js 15 + React 19 + Chakra UI) с новым бэкенд API. Сейчас приложение работает с OpenAI API напрямую, но нужно переключить его на работу с собственным бэкендом, который предоставляет API для авторизации через Telegram, управления проектами, чатами и сообщениями.

### Основные изменения

1. **Замена OpenAI API на собственный бэкенд** - вместо прямых вызовов OpenAI нужно работать через собственный API
2. **Добавление авторизации** - вход через Telegram с сохранением токенов
3. **Управление проектами** - создание папок для группировки чатов
4. **Обновление чатов** - привязка чатов к проектам
5. **Streaming сообщений** - реализация потоковой передачи ответов от AI

### Что НЕ нужно делать

- Не нужно реализовывать logout (по требованию заказчика)
- Не нужно менять дизайн или UI компоненты
- Не нужно реализовывать бэкенд - только фронтенд интеграцию

## 1. Анализ требований и архитектуры

### Существующая архитектура проекта:

- **Framework**: Next.js 15 с App Router
- **State Management**: React Context + localStorage
- **UI Library**: Chakra UI
- **API Integration**: Edge Runtime API routes
- **Existing Features**: Telegram авторизация, чат интерфейс, проекты

### Требования к реализации:

- ✅ **Авторизация**: Telegram login, обновление токенов
- ✅ **Проекты**: CRUD операции
- ✅ **Чаты**: CRUD операции с фильтрацией по проектам
- ✅ **Сообщения**: получение списка, streaming отправка
- ❌ **Logout**: исключен по ТЗ

## 2. Структура TypeScript типов

### 2.1 API Response типы

```typescript
// src/types/api.ts
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
}

// Streaming types
export interface StreamingResponse {
  type: "message" | "error" | "done";
  data?: any;
  error?: string;
}
```

### 2.2 Обновление существующих типов

```typescript
// src/types/chat.ts - дополнение к существующим типам
export interface Chat {
  id: number; // Изменено с string на number
  title?: string;
  isActive?: boolean;
  lastMessage?: string;
  date?: string;
  project_id?: number | null;
  model?: string | null;
  temperature?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number; // Изменено с string на number
  name: string;
  description?: string | null;
  chats: Chat[];
  isExpanded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id?: number; // Изменено с string на number
  chat_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  client_message_id?: string;
  timestamp?: Date; // Сохраняем для совместимости
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    thinkingText?: string;
    hasThinkingProcess?: boolean;
    thinkingExpanded?: boolean;
  };
}
```

## 3. API Client архитектура

### 3.1 Base API Client

```typescript
// src/utils/apiClient.ts
class ApiClient {
  private baseURL = "/api/web/v1";
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Загружаем токены из localStorage при инициализации
    if (typeof window !== "undefined") {
      this.loadTokensFromStorage();
    }
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem("access_token");
    this.refreshToken = localStorage.getItem("refresh_token");
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  private clearTokensFromStorage() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.refreshToken}`,
        },
      });

      if (response.ok) {
        const tokens: AuthTokenResponse = await response.json();
        this.saveTokensToStorage(tokens.access_token, tokens.refresh_token);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    this.clearTokensFromStorage();
    return false;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Если 401 и есть refresh token, попробуем обновить
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();

      if (refreshed && this.accessToken) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async loginWithTelegram(
    authData: TelegramAuthPayload,
  ): Promise<AuthTokenResponse> {
    const response = await this.request<AuthTokenResponse>("/auth/telegram", {
      method: "POST",
      body: JSON.stringify(authData),
    });

    this.saveTokensToStorage(response.access_token, response.refresh_token);
    return response;
  }

  async getCurrentUser(): Promise<UserRead> {
    return this.request<UserRead>("/me");
  }

  // Projects methods
  async getProjects(
    limit = 20,
    cursor?: string,
  ): Promise<PaginatedResponse<ProjectRead>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);

    return this.request<PaginatedResponse<ProjectRead>>(`/projects?${params}`);
  }

  async createProject(data: ProjectCreate): Promise<ProjectRead> {
    return this.request<ProjectRead>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProject(projectId: number): Promise<ProjectRead> {
    return this.request<ProjectRead>(`/projects/${projectId}`);
  }

  async updateProject(
    projectId: number,
    data: ProjectUpdate,
  ): Promise<ProjectRead> {
    return this.request<ProjectRead>(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: number): Promise<void> {
    await this.request(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  // Chats methods
  async getChats(
    limit = 20,
    cursor?: string,
    projectId?: number,
  ): Promise<PaginatedResponse<ChatRead>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);
    if (projectId) params.append("project_id", projectId.toString());

    return this.request<PaginatedResponse<ChatRead>>(`/chats?${params}`);
  }

  async createChat(data: ChatCreate): Promise<ChatRead> {
    return this.request<ChatRead>("/chats", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getChat(chatId: number): Promise<ChatRead> {
    return this.request<ChatRead>(`/chats/${chatId}`);
  }

  async updateChat(chatId: number, data: ChatUpdate): Promise<ChatRead> {
    return this.request<ChatRead>(`/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteChat(chatId: number): Promise<void> {
    await this.request(`/chats/${chatId}`, {
      method: "DELETE",
    });
  }

  // Messages methods
  async getMessages(
    chatId: number,
    limit = 50,
    cursor?: string,
  ): Promise<PaginatedResponse<MessageRead>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);

    return this.request<PaginatedResponse<MessageRead>>(
      `/chats/${chatId}/messages?${params}`,
    );
  }

  async deleteMessage(chatId: number, messageId: number): Promise<void> {
    await this.request(`/chats/${chatId}/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  async getRequestStatus(
    chatId: number,
    clientMessageId: string,
  ): Promise<any> {
    return this.request(`/chats/${chatId}/requests/${clientMessageId}`);
  }

  // Streaming messages
  async streamMessage(
    chatId: number,
    content: string,
    clientMessageId?: string,
  ): Promise<ReadableStream> {
    const url = `${this.baseURL}/chats/${chatId}/messages/stream`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content,
        client_message_id: clientMessageId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    return response.body;
  }
}

export const apiClient = new ApiClient();
```

## 4. Context и State Management

### 4.1 Auth Context

```typescript
// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/utils/apiClient';
import { UserRead } from '@/types/api';
import { useTelegram } from './TelegramContext';

interface AuthContextType {
  user: UserRead | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: telegramUser, isTelegramEnvironment } = useTelegram();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Не устанавливаем ошибку, просто пользователь не авторизован
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (!telegramUser || !isTelegramEnvironment) {
      setError('Telegram authentication required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Подготавливаем данные для авторизации
      const authPayload = {
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        auth_date: Math.floor(Date.now() / 1000), // Current timestamp
        hash: 'mock_hash', // В реальном приложении это должен быть валидный хеш
      };

      await apiClient.loginWithTelegram(authPayload);
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 4.2 Projects Context

```typescript
// src/contexts/ProjectsContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectRead, ChatRead } from '@/types/api';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from './AuthContext';

interface ProjectsContextType {
  projects: ProjectRead[];
  currentProject: ProjectRead | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<ProjectRead>;
  updateProject: (id: number, data: { name?: string; description?: string }) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  setCurrentProject: (project: ProjectRead | null) => void;
}

const ProjectsContext = createContext<ProjectsContextType | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectRead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getProjects();
      setProjects(response.items);

      // TODO: Implement pagination for large project lists
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (name: string, description?: string): Promise<ProjectRead> => {
    try {
      setError(null);
      const newProject = await apiClient.createProject({ name, description });
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setError(errorMessage);
      throw error;
    }
  };

  const updateProject = async (id: number, data: { name?: string; description?: string }) => {
    try {
      setError(null);
      const updatedProject = await apiClient.updateProject(id, data);

      setProjects(prev =>
        prev.map(project => project.id === id ? updatedProject : project)
      );

      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      setError(error instanceof Error ? error.message : 'Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      setError(null);
      await apiClient.deleteProject(id);

      setProjects(prev => prev.filter(project => project.id !== id));

      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete project');
      throw error;
    }
  };

  const value: ProjectsContextType = {
    projects,
    currentProject,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects(): ProjectsContextType {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
```

## 5. Streaming реализация

### 5.1 Stream Handler

```typescript
// src/utils/streamHandler.ts
import { apiClient } from "./apiClient";

export interface StreamEvent {
  type: "message_start" | "message_delta" | "message_end" | "error";
  data?: any;
  error?: string;
}

export class MessageStreamHandler {
  private decoder = new TextDecoder();

  async handleStream(
    chatId: number,
    content: string,
    onEvent: (event: StreamEvent) => void,
    clientMessageId?: string,
  ): Promise<void> {
    try {
      const stream = await apiClient.streamMessage(
        chatId,
        content,
        clientMessageId,
      );
      const reader = stream.getReader();

      let buffer = "";
      let isReading = true;

      while (isReading) {
        const { done, value } = await reader.read();

        if (done) {
          isReading = false;
          onEvent({ type: "message_end" });
          break;
        }

        // Декодируем chunk и добавляем к буферу
        const chunk = this.decoder.decode(value, { stream: true });
        buffer += chunk;

        // Обрабатываем все полные строки в буфере
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Сохраняем неполную строку в буфере

        for (const line of lines) {
          if (line.trim() === "") continue;

          try {
            // Предполагаем, что каждая строка - это JSON объект
            const eventData = JSON.parse(line);
            onEvent({
              type: eventData.type || "message_delta",
              data: eventData.data,
            });
          } catch (parseError) {
            // Если не JSON, обрабатываем как обычный текст
            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              try {
                const parsedData = JSON.parse(data);
                onEvent({
                  type: "message_delta",
                  data: parsedData,
                });
              } catch {
                onEvent({
                  type: "message_delta",
                  data: { content: data },
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream handling error:", error);
      onEvent({
        type: "error",
        error: error instanceof Error ? error.message : "Streaming failed",
      });
    }
  }
}

export const streamHandler = new MessageStreamHandler();
```

### 5.2 Chat Hook с Streaming

```typescript
// src/hooks/useChat.ts
import { useState, useCallback } from "react";
import { MessageRead, ChatRead } from "@/types/api";
import { apiClient } from "@/utils/apiClient";
import { streamHandler, StreamEvent } from "@/utils/streamHandler";

export function useChat(chatId?: number) {
  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getMessages(chatId);
      setMessages(response.items);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load messages",
      );
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!chatId || !content.trim()) return;

      const clientMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      try {
        setIsStreaming(true);
        setError(null);

        // Добавляем пользовательское сообщение сразу
        const userMessage: MessageRead = {
          id: Date.now(), // Временный ID
          chat_id: chatId,
          role: "user",
          content: content.trim(),
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Создаем сообщение ассистента для отображения процесса
        const assistantMessage: MessageRead = {
          id: Date.now() + 1, // Временный ID
          chat_id: chatId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Обрабатываем stream
        await streamHandler.handleStream(
          chatId,
          content,
          (event: StreamEvent) => {
            switch (event.type) {
              case "message_start":
                // Сообщение начато
                break;

              case "message_delta":
                // Обновляем контент ассистента
                if (event.data?.content) {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                      lastMessage.content += event.data.content;
                    }
                    return newMessages;
                  });
                }
                break;

              case "message_end":
                // Перезагружаем сообщения для получения актуальных ID
                loadMessages();
                break;

              case "error":
                console.error("Stream error:", event.error);
                setError(event.error || "Streaming error occurred");
                // Удаляем незавершенное сообщение ассистента
                setMessages((prev) => prev.slice(0, -1));
                break;
            }
          },
          clientMessageId,
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to send message",
        );
        // Удаляем добавленные сообщения при ошибке
        setMessages((prev) => prev.slice(0, -2));
      } finally {
        setIsStreaming(false);
      }
    },
    [chatId, loadMessages],
  );

  const deleteMessage = useCallback(
    async (messageId: number) => {
      if (!chatId) return;

      try {
        await apiClient.deleteMessage(chatId, messageId);
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (error) {
        console.error("Failed to delete message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to delete message",
        );
      }
    },
    [chatId],
  );

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    loadMessages,
    sendMessage,
    deleteMessage,
  };
}
```

## 6. Последовательность реализации

### Phase 1: Основная инфраструктура (1-2 дня)

#### Что конкретно делать:

1. **Создать TypeScript типы** (`src/types/api.ts`)
   - Скопировать все типы из раздела 2.1 этого документа
   - Создать новый файл `src/types/api.ts`
   - Вставить туда все интерфейсы для API
   - Убедиться что TypeScript не выдает ошибок

2. **Реализовать ApiClient** (`src/utils/apiClient.ts`)
   - Создать новый файл `src/utils/apiClient.ts`
   - Скопировать весь код класса ApiClient из раздела 3.1
   - Это центральный класс для всех API вызовов
   - Проверить что импорты типов работают корректно
   - **ВАЖНО**: Обратить внимание на методы `refreshAccessToken` и `request` - они автоматически обновляют токены

3. **Обновить существующие типы** (`src/types/chat.ts`)
   - Открыть существующий файл `src/types/chat.ts`
   - Изменить тип `id` с `string` на `number` во всех интерфейсах
   - Добавить новые поля из раздела 2.2 (project_id, created_at, updated_at)
   - Проверить что нигде в коде не сломались типы после изменения

4. **Создать AuthContext** (`src/contexts/AuthContext.tsx`)
   - Создать новый файл для контекста авторизации
   - Скопировать код из раздела 4.1
   - Этот контекст будет управлять состоянием авторизации пользователя
   - При загрузке приложения автоматически проверяет наличие токенов

### Phase 2: Авторизация (1 день)

#### Что конкретно делать:

1. **Интегрировать с TelegramContext**
   - Найти существующий `TelegramContext` в проекте
   - В `AuthContext` импортировать `useTelegram` хук
   - При вызове `login()` брать данные пользователя из Telegram контекста
   - Формировать объект `TelegramAuthPayload` с полями из Telegram
   - **ВАЖНО**: В реальном приложении поле `hash` должен генерировать бэкенд, сейчас можно использовать заглушку

2. **Реализовать login flow**
   - В главном компоненте приложения добавить проверку авторизации
   - Если пользователь не авторизован - показывать кнопку "Войти через Telegram"
   - При клике вызывать метод `login()` из `AuthContext`
   - После успешного входа автоматически загружать проекты и чаты
   - Токены автоматически сохраняются в localStorage

3. **Добавить token refresh logic**
   - Логика уже реализована в `ApiClient`
   - При любом запросе, если получаем 401 ошибку, автоматически обновляем токен
   - Если обновление успешно - повторяем исходный запрос
   - Если обновление не удалось - очищаем токены и показываем форму входа

4. **Обновить UI для показа статуса авторизации**
   - В компоненте `Navbar` добавить отображение имени пользователя
   - В `Sidebar` показывать заглушку если пользователь не авторизован
   - Добавить индикатор загрузки при проверке авторизации
   - Использовать данные из `useAuth()` хука

### Phase 3: Проекты (1 день)

#### Что конкретно делать:

1. **Создать ProjectsContext** (`src/contexts/ProjectsContext.tsx`)
   - Создать новый файл контекста для управления проектами
   - Скопировать код из раздела 4.2
   - Контекст автоматически загружает проекты при авторизации
   - Предоставляет методы для CRUD операций с проектами
   - Хранит текущий выбранный проект

2. **Обновить sidebar для отображения проектов**
   - Открыть `src/components/sidebar/Sidebar.tsx`
   - Импортировать `useProjects` хук
   - Заменить существующий список чатов на список проектов
   - Каждый проект должен быть раскрывающимся элементом
   - Внутри проекта показывать список его чатов
   - Добавить иконку папки для проектов
   - При клике на проект - раскрывать/скрывать его чаты

3. **Реализовать CRUD операции в UI**
   - **Создание**: Кнопка "+ Новый проект" в верхней части sidebar
   - **Чтение**: Автоматическая загрузка при входе
   - **Обновление**: Контекстное меню → "Переименовать"
   - **Удаление**: Контекстное меню → "Удалить проект"
   - Использовать существующие компоненты Chakra UI для меню

4. **Добавить модалы для создания/редактирования проектов**
   - Создать `src/components/modals/ProjectModal.tsx`
   - Использовать Chakra UI Modal компонент
   - Форма с полями: название (обязательное), описание (опциональное)
   - При сохранении вызывать `createProject` или `updateProject` из контекста
   - Показывать ошибки валидации если название пустое
   - После успешного создания автоматически выбирать новый проект

### Phase 4: Чаты (1 день)

#### Что конкретно делать:

1. **Обновить существующие компоненты чатов**
   - Найти все места где используется тип `Chat`
   - Обновить импорты чтобы использовать новые типы из `api.ts`
   - Изменить все места где `chat.id` сравнивается как строка на число
   - Добавить поле `project_id` во все места создания чата
   - Обновить компонент `ChatItem` для отображения в рамках проекта

2. **Интегрировать с ProjectsContext**
   - При создании чата передавать `project_id` текущего проекта
   - При загрузке чатов фильтровать по `project_id`
   - При удалении проекта удалять все его чаты
   - При переключении проекта загружать только его чаты

3. **Реализовать фильтрацию по проектам**
   - В методе `getChats` передавать `projectId` как параметр
   - Показывать только чаты текущего выбранного проекта
   - Добавить возможность перемещения чата между проектами
   - При перемещении обновлять `project_id` через API

4. **Обновить модалы управления чатами**
   - В `ChatModal` добавить выпадающий список проектов
   - При создании чата предвыбирать текущий проект
   - Добавить возможность создать чат без проекта (project_id = null)
   - В модале настроек чата показывать и позволять менять:
     - Название чата
     - Проект
     - Модель AI (если поддерживается бэкендом)
     - Temperature (если поддерживается бэкендом)
     - System prompt

### Phase 5: Сообщения и Streaming (2 дня)

#### Что конкретно делать:

1. **Создать StreamHandler** (`src/utils/streamHandler.ts`)
   - Создать новый файл для обработки streaming
   - Скопировать код из раздела 5.1
   - Этот класс обрабатывает поток данных от сервера
   - Парсит Server-Sent Events или JSON строки
   - Вызывает колбэки для каждого типа события
   - **ВАЖНО**: Проверить формат streaming ответов вашего бэкенда

2. **Реализовать useChat hook** (`src/hooks/useChat.ts`)
   - Создать новый хук для управления чатом
   - Скопировать код из раздела 5.2
   - Хук управляет:
     - Загрузкой истории сообщений
     - Отправкой новых сообщений
     - Обработкой streaming ответов
     - Удалением сообщений
   - **ВАЖНО**: При отправке сообщения сразу добавлять его в UI, не дожидаясь ответа

3. **Обновить MessageBox компонент**
   - Найти `src/components/MessageBox.tsx`
   - Обновить для работы с новой структурой сообщений
   - Добавить поддержку streaming - показывать текст по мере поступления
   - Добавить индикатор "AI печатает..." во время streaming
   - Реализовать плавное появление текста (по символам или словам)
   - Добавить кнопку остановки генерации если streaming активен

4. **Интегрировать streaming в chat interface**
   - В главном компоненте чата использовать `useChat` хук
   - При отправке сообщения:
     1. Блокировать поле ввода
     2. Добавить сообщение пользователя в список
     3. Добавить пустое сообщение AI с индикатором загрузки
     4. Начать streaming и обновлять текст AI по мере получения
     5. После завершения разблокировать поле ввода
   - Обработка ошибок:
     - Показывать уведомление если streaming прервался
     - Предлагать повторить отправку
     - Не терять сообщение пользователя при ошибке

### Phase 6: Тестирование и полировка (1 день)

#### Что конкретно делать:

1. **Тестировать все API endpoints**
   - Создать тестовый аккаунт и пройти весь флоу:
     - Вход через Telegram
     - Создание проекта
     - Создание чата в проекте
     - Отправка сообщений
     - Получение streaming ответов
   - Проверить работу с невалидными данными:
     - Пустые поля
     - Слишком длинные тексты
     - Специальные символы
   - Проверить работу пагинации для больших списков

2. **Обработать edge cases**
   - **Потеря соединения**: Показывать уведомление и предлагать переподключиться
   - **Истечение токена**: Автоматически обновлять или показывать форму входа
   - **Пустые списки**: Показывать placeholder "Нет проектов/чатов"
   - **Удаление активного элемента**: Переключаться на следующий или показывать заглушку
   - **Одновременное редактирование**: Блокировать UI во время запросов
   - **Быстрые клики**: Добавить debounce для предотвращения дублей

3. **Улучшить error handling**
   - Добавить глобальный обработчик ошибок
   - Для каждого типа ошибки показывать понятное сообщение:
     - 400: "Неверные данные, проверьте ввод"
     - 401: "Необходима авторизация"
     - 403: "Нет доступа к этому ресурсу"
     - 404: "Элемент не найден"
     - 429: "Слишком много запросов, подождите"
     - 500: "Ошибка сервера, попробуйте позже"
   - Логировать ошибки в консоль для отладки
   - Добавить возможность повторить неудачный запрос

4. **Оптимизировать performance**
   - **Кэширование**: Сохранять загруженные проекты/чаты в память
   - **Lazy loading**: Загружать сообщения по мере прокрутки
   - **Debounce**: Для поиска и автосохранения
   - **Memoization**: Использовать React.memo для тяжелых компонентов
   - **Virtual scrolling**: Для длинных списков сообщений
   - **Оптимизация ререндеров**: Использовать useCallback и useMemo
   - **Сжатие изображений**: Если есть аватарки пользователей

## 7. Интеграция с существующей архитектурой

### 7.1 Обновление App Layout

```typescript
// app/layout.tsx - добавить новые провайдеры
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider theme={theme}>
          <TelegramProvider>
            <AuthProvider>
              <ProjectsProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </ProjectsProvider>
            </AuthProvider>
          </TelegramProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
```

### 7.2 Обновление существующих компонентов

```typescript
// src/components/sidebar/Sidebar.tsx - интеграция с новыми contexts
import { useProjects } from '@/contexts/ProjectsContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProjects();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <Box>
      {/* Existing sidebar content */}
      <ProjectsList
        projects={projects}
        currentProject={currentProject}
        onProjectSelect={setCurrentProject}
      />
    </Box>
  );
}
```

## 8. Особенности работы с токенами

### 8.1 Token Management Strategy

- **Access Token**: Короткоживущий (1-24 часа), используется для API запросов
- **Refresh Token**: Долгоживущий (7-30 дней), используется для обновления access token
- **Automatic Refresh**: При получении 401 автоматически пытаемся обновить токен
- **Storage**: localStorage для веб-версии, AsyncStorage для мобильных приложений
- **Security**: Токены не передаются в URL параметрах

### 8.2 Error Handling

- **Network Errors**: Retry logic с exponential backoff
- **401 Unauthorized**: Автоматическое обновление токена
- **403 Forbidden**: Показать сообщение об отсутствии прав
- **429 Rate Limit**: Показать уведомление о превышении лимита
- **500 Server Error**: Показать сообщение о технических проблемах

## 9. Streaming Implementation Details

### 9.1 Server-Sent Events (SSE) Approach

```typescript
// Пример обработки SSE потока
const processSSEStream = async (response: Response) => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;

        try {
          const json = JSON.parse(data);
          onMessageChunk(json);
        } catch (e) {
          console.error("Failed to parse SSE data:", e);
        }
      }
    }
  }
};
```

### 9.2 Message Aggregation

- **Chunk Assembly**: Собираем частичные сообщения в полные
- **State Management**: Отслеживаем состояние streaming для UI
- **Error Recovery**: Обработка разрывов соединения
- **Performance**: Debounce обновлений UI для плавности

## 10. Testing Strategy

### 10.1 Unit Tests

- **API Client**: Тестировать все endpoints
- **Stream Handler**: Mock streaming responses
- **Context Providers**: Тестировать state management
- **Utility Functions**: Token management, error handling

### 10.2 Integration Tests

- **Auth Flow**: Full login/logout cycle
- **CRUD Operations**: Projects and chats management
- **Streaming**: Mock streaming API responses
- **Error Scenarios**: Network failures, token expiration

### 10.3 E2E Tests

- **User Journey**: Complete app workflow
- **Cross-browser**: Chrome, Safari, Firefox
- **Mobile**: Responsive design testing
- **Performance**: Load time and memory usage

## 11. Частые проблемы и их решения

### Проблема: Токены не сохраняются

**Решение**: Проверить что localStorage доступен и не блокируется браузером. В режиме инкогнито может не работать.

### Проблема: CORS ошибки при вызове API

**Решение**: Убедиться что бэкенд разрешает запросы с вашего домена. Использовать прокси в next.config.js:

```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/web/v1/:path*",
        destination: "https://backend-url.com/api/web/v1/:path*",
      },
    ];
  },
};
```

### Проблема: Streaming не работает

**Решение**: Проверить что бэкенд отправляет правильный Content-Type: text/event-stream. Убедиться что прокси не буферизует ответы.

### Проблема: Типы не совпадают с бэкендом

**Решение**: Сгенерировать типы из OpenAPI спецификации используя openapi-typescript:

```bash
npx openapi-typescript openapi.json -o src/types/generated-api.ts
```

### Проблема: Пользователь видит старые данные после изменений

**Решение**: После мутирующих операций (создание, обновление, удаление) перезагружать связанные данные или использовать оптимистичные обновления.

## 12. Checklist для разработчика

### Перед началом работы:

- [ ] Получить доступ к тестовому бэкенду
- [ ] Получить тестовый Telegram аккаунт
- [ ] Изучить существующую кодовую базу
- [ ] Проверить что все зависимости установлены

### Phase 1 выполнен когда:

- [ ] Созданы все TypeScript типы
- [ ] ApiClient успешно делает запросы
- [ ] AuthContext загружается без ошибок
- [ ] Токены сохраняются в localStorage

### Phase 2 выполнен когда:

- [ ] Пользователь может войти через Telegram
- [ ] Токены автоматически обновляются
- [ ] UI показывает статус авторизации
- [ ] После входа загружаются данные пользователя

### Phase 3 выполнен когда:

- [ ] Проекты отображаются в sidebar
- [ ] Можно создать новый проект
- [ ] Можно переименовать проект
- [ ] Можно удалить проект
- [ ] Чаты группируются по проектам

### Phase 4 выполнен когда:

- [ ] Чаты привязаны к проектам
- [ ] Можно создать чат в проекте
- [ ] Можно перенести чат между проектами
- [ ] Фильтрация чатов работает корректно

### Phase 5 выполнен когда:

- [ ] Сообщения загружаются из API
- [ ] Streaming работает плавно
- [ ] Текст появляется по мере генерации
- [ ] Ошибки обрабатываются корректно

### Phase 6 выполнен когда:

- [ ] Все функции протестированы
- [ ] Edge cases обработаны
- [ ] Производительность оптимизирована
- [ ] Ошибки показывают понятные сообщения

## 13. API Endpoints Reference

### Авторизация

| Endpoint         | Method | Описание            | Использование                 |
| ---------------- | ------ | ------------------- | ----------------------------- |
| `/auth/telegram` | POST   | Вход через Telegram | При первом входе пользователя |
| `/auth/refresh`  | POST   | Обновление токенов  | Автоматически при 401 ошибке  |
| `/me`            | GET    | Данные пользователя | После успешной авторизации    |

### Проекты

| Endpoint         | Method | Описание        | Использование           |
| ---------------- | ------ | --------------- | ----------------------- |
| `/projects`      | GET    | Список проектов | При загрузке sidebar    |
| `/projects`      | POST   | Создать проект  | Кнопка "New Project"    |
| `/projects/{id}` | GET    | Получить проект | При открытии проекта    |
| `/projects/{id}` | PATCH  | Изменить проект | Редактирование названия |
| `/projects/{id}` | DELETE | Удалить проект  | Контекстное меню        |

### Чаты

| Endpoint      | Method | Описание     | Использование           |
| ------------- | ------ | ------------ | ----------------------- |
| `/chats`      | GET    | Список чатов | При загрузке проекта    |
| `/chats`      | POST   | Создать чат  | Кнопка "New Chat"       |
| `/chats/{id}` | GET    | Получить чат | При открытии чата       |
| `/chats/{id}` | PATCH  | Изменить чат | Редактирование настроек |
| `/chats/{id}` | DELETE | Удалить чат  | Контекстное меню        |

### Сообщения

| Endpoint                       | Method | Описание             | Использование          |
| ------------------------------ | ------ | -------------------- | ---------------------- |
| `/chats/{id}/messages`         | GET    | История сообщений    | При открытии чата      |
| `/chats/{id}/messages/stream`  | POST   | Отправка с streaming | При отправке сообщения |
| `/chats/{id}/messages/{msgId}` | DELETE | Удалить сообщение    | Контекстное меню       |

Этот план обеспечивает полную интеграцию с новым API при сохранении существующей архитектуры и UX паттернов приложения.
