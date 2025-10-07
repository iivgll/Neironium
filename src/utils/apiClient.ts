import {
  TelegramAuthPayload,
  AuthTokenResponse,
  UserRead,
  ProjectCreate,
  ProjectUpdate,
  ProjectRead,
  PaginatedResponse,
  ChatCreate,
  ChatUpdate,
  ChatRead,
  MessageRead,
} from "@/types/api";

class ApiClient {
  private baseURL = "/api/web/v1";
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
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

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T | null> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If 401 or 403 and we have refresh token, try to refresh
    if (
      (response.status === 401 || response.status === 403) &&
      this.refreshToken
    ) {
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

    // Проверяем, есть ли контент для парсинга
    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type");

    if (
      response.status === 204 ||
      contentLength === "0" ||
      (!contentType?.includes("json") && !response.body)
    ) {
      return null;
    }

    return response.json();
  }

  private async requestRequired<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await this.request<T>(endpoint, options);
    if (response === null) {
      throw new Error(`Request to ${endpoint} returned null`);
    }
    return response;
  }

  // Auth methods
  async loginWithTelegram(
    authData: TelegramAuthPayload,
  ): Promise<AuthTokenResponse> {
    const response = await this.request<AuthTokenResponse>("/auth/telegram", {
      method: "POST",
      body: JSON.stringify(authData),
    });

    if (!response) {
      throw new Error("Failed to authenticate with Telegram");
    }

    this.saveTokensToStorage(response.access_token, response.refresh_token);
    return response;
  }

  async getCurrentUser(): Promise<UserRead> {
    return this.requestRequired<UserRead>("/me");
  }

  // Projects methods
  async getProjects(
    limit = 20,
    cursor?: string,
  ): Promise<PaginatedResponse<ProjectRead>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);

    return this.requestRequired<PaginatedResponse<ProjectRead>>(
      `/projects?${params}`,
    );
  }

  async createProject(data: ProjectCreate): Promise<ProjectRead> {
    return this.requestRequired<ProjectRead>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProject(projectId: number): Promise<ProjectRead> {
    return this.requestRequired<ProjectRead>(`/projects/${projectId}`);
  }

  async updateProject(
    projectId: number,
    data: ProjectUpdate,
  ): Promise<ProjectRead> {
    return this.requestRequired<ProjectRead>(`/projects/${projectId}`, {
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

    return this.requestRequired<PaginatedResponse<ChatRead>>(
      `/chats?${params}`,
    );
  }

  async createChat(data: ChatCreate): Promise<ChatRead> {
    return this.requestRequired<ChatRead>("/chats", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getChat(chatId: number): Promise<ChatRead> {
    return this.requestRequired<ChatRead>(`/chats/${chatId}`);
  }

  async updateChat(chatId: number, data: ChatUpdate): Promise<ChatRead> {
    return this.requestRequired<ChatRead>(`/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteChat(chatId: number): Promise<void> {
    await this.request<void>(`/chats/${chatId}`, {
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

    return this.requestRequired<PaginatedResponse<MessageRead>>(
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

    const headers: Record<string, string> = {
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
