"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ChatRead, ChatCreate, ChatUpdate, MessageRead } from "@/types/api";
import { apiClient } from "@/utils/apiClient";
import { useAuth } from "./AuthContext";
import { useProjects } from "./ProjectsContext";

interface ChatsContextType {
  // State
  chats: ChatRead[];
  activeChat: ChatRead | null;
  activeChatId: number | null;
  isLoading: boolean;
  error: string | null;

  // Chat management
  loadChats: (projectId?: number) => Promise<void>;
  createChat: (data: ChatCreate) => Promise<ChatRead>;
  updateChat: (id: number, data: ChatUpdate) => Promise<void>;
  deleteChat: (id: number) => Promise<void>;
  setActiveChat: (chatId: number | null) => void;

  // Helper methods
  getChatsByProject: (projectId: number | null) => ChatRead[];
  getChatsWithoutProject: () => ChatRead[];

  // Messages management
  messages: MessageRead[];
  loadMessages: (chatId: number) => Promise<void>;
  isLoadingMessages: boolean;
}

const ChatsContext = createContext<ChatsContextType | null>(null);

export function ChatsProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<ChatRead[]>([]);
  const [activeChat, setActiveChatState] = useState<ChatRead | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(() => {
    // Restore active chat from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("activeChatId");
      return saved ? parseInt(saved, 10) : null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Messages state
  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const { isAuthenticated } = useAuth();
  const { currentProject } = useProjects();

  const loadChats = useCallback(
    async (projectId?: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.getChats(50, undefined, projectId);
        setChats(response.items);

        // If we had an active chat and it's still in the list, keep it active
        if (activeChatId) {
          const stillExists = response.items.find(
            (chat) => chat.id === activeChatId,
          );
          if (!stillExists) {
            setActiveChatId(null);
            setActiveChatState(null);
          }
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load chats",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeChatId],
  );

  const createChat = useCallback(
    async (data: ChatCreate): Promise<ChatRead> => {
      try {
        setError(null);
        const newChat = await apiClient.createChat(data);

        // Add to local state
        setChats((prev) => [newChat, ...prev]);

        // Automatically set as active chat
        setActiveChatId(newChat.id);
        setActiveChatState(newChat);

        return newChat;
      } catch (error) {
        console.error("Failed to create chat:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create chat";
        setError(errorMessage);
        throw error;
      }
    },
    [],
  );

  const updateChat = useCallback(
    async (id: number, data: ChatUpdate) => {
      try {
        setError(null);
        const updatedChat = await apiClient.updateChat(id, data);

        setChats((prev) =>
          prev.map((chat) => (chat.id === id ? updatedChat : chat)),
        );

        if (activeChatId === id) {
          setActiveChatState(updatedChat);
        }
      } catch (error) {
        console.error("Failed to update chat:", error);
        setError(
          error instanceof Error ? error.message : "Failed to update chat",
        );
        throw error;
      }
    },
    [activeChatId],
  );

  const deleteChat = useCallback(
    async (id: number) => {
      try {
        setError(null);
        await apiClient.deleteChat(id);

        setChats((prev) => prev.filter((chat) => chat.id !== id));

        if (activeChatId === id) {
          setActiveChatId(null);
          setActiveChatState(null);
        }
      } catch (error) {
        console.error("Failed to delete chat:", error);
        setError(
          error instanceof Error ? error.message : "Failed to delete chat",
        );
        throw error;
      }
    },
    [activeChatId],
  );

  const setActiveChat = useCallback(
    (chatId: number | null) => {
      setActiveChatId(chatId);

      // Save to localStorage
      if (typeof window !== "undefined") {
        if (chatId) {
          localStorage.setItem("activeChatId", chatId.toString());
        } else {
          localStorage.removeItem("activeChatId");
        }
      }

      if (chatId) {
        const chat = chats.find((c) => c.id === chatId);
        setActiveChatState(chat || null);
      } else {
        setActiveChatState(null);
      }
    },
    [chats],
  );

  const loadMessages = useCallback(async (chatId: number) => {
    try {
      setIsLoadingMessages(true);
      const response = await apiClient.getMessages(chatId);
      setMessages(response.items);
    } catch (error) {
      console.error("Failed to load messages:", error);
      // Don't set main error for messages, just log it
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Load chats when authenticated (load all chats, not filtered by project)
  useEffect(() => {
    if (isAuthenticated) {
      loadChats(); // Load all chats without project filter
    }
  }, [isAuthenticated, loadChats]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId, loadMessages]);

  // Helper methods for filtering chats
  const getChatsByProject = useCallback(
    (projectId: number | null) => {
      return chats.filter((chat) => chat.project_id === projectId);
    },
    [chats],
  );

  const getChatsWithoutProject = useCallback(() => {
    return chats.filter(
      (chat) => chat.project_id === null || chat.project_id === undefined,
    );
  }, [chats]);

  const value: ChatsContextType = {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    error,
    loadChats,
    createChat,
    updateChat,
    deleteChat,
    setActiveChat,
    getChatsByProject,
    getChatsWithoutProject,
    messages,
    loadMessages,
    isLoadingMessages,
  };

  return (
    <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>
  );
}

export function useChatsContext(): ChatsContextType {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChatsContext must be used within a ChatsProvider");
  }
  return context;
}
