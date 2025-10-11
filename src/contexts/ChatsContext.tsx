"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  ChatRead,
  ChatCreate,
  ChatUpdate,
  MessageRead,
  ChatTreeItem,
} from "@/types/api";
import { apiClient } from "@/utils/apiClient";
import { useAuth } from "./AuthContext";
import { Chat } from "@/types/chat";

interface ChatsContextType {
  // State
  chats: Chat[];
  chatsTree: Chat[];
  activeChat: ChatRead | null;
  activeChatId: number | null;
  isLoading: boolean;
  error: string | null;

  // Chat management
  loadChats: () => Promise<void>;
  createChat: (data: ChatCreate) => Promise<ChatRead>;
  updateChat: (id: number, data: ChatUpdate) => Promise<void>;
  deleteChat: (id: number) => Promise<void>;
  setActiveChat: (chatId: number | null) => void;

  // Messages management
  messages: MessageRead[];
  loadMessages: (chatId: number) => Promise<void>;
  isLoadingMessages: boolean;
}

const ChatsContext = createContext<ChatsContextType | null>(null);

export function ChatsProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsTree, setChatsTree] = useState<Chat[]>([]);
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

  const buildChatTree = useCallback((items: ChatTreeItem[]): Chat[] => {
    // Recursively convert ChatTreeItem to Chat
    const convertItem = (item: ChatTreeItem): Chat => ({
      id: item.id,
      title: item.title || undefined,
      parent_id: item.parent_id,
      created_at: "",
      updated_at: "",
      description: item.description || undefined,
      files_count: item.files_count,
      files: item.files, // Copy files from API
      children: item.children.map(convertItem),
    });

    return items.map(convertItem);
  }, []);

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const treeResponse = await apiClient.getChatsTree();
      const tree = buildChatTree(treeResponse.items);
      setChatsTree(tree);

      // Flatten tree for backward compatibility
      const flatChats: Chat[] = [];
      const flatten = (chats: Chat[]) => {
        chats.forEach((chat) => {
          flatChats.push(chat);
          if (chat.children && chat.children.length > 0) {
            flatten(chat.children);
          }
        });
      };
      flatten(tree);
      setChats(flatChats);

      // If we had an active chat and it's still in the list, keep it active
      if (activeChatId) {
        const stillExists = flatChats.find((chat) => chat.id === activeChatId);
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
  }, [activeChatId, buildChatTree]);

  const createChat = useCallback(
    async (data: ChatCreate): Promise<ChatRead> => {
      try {
        setError(null);
        const newChat = await apiClient.createChat(data);

        // Convert ChatRead to Chat for local state
        const chatForState: Chat = {
          id: newChat.id,
          title: newChat.title || undefined,
          parent_id: newChat.parent_id,
          model: newChat.model,
          temperature: newChat.temperature,
          created_at: newChat.created_at,
          updated_at: newChat.updated_at,
        };

        // Add to local state
        setChats((prev) => [chatForState, ...prev]);

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

        // Convert ChatRead to Chat for local state
        const chatForState: Chat = {
          id: updatedChat.id,
          title: updatedChat.title || undefined,
          parent_id: updatedChat.parent_id,
          model: updatedChat.model,
          temperature: updatedChat.temperature,
          created_at: updatedChat.created_at,
          updated_at: updatedChat.updated_at,
        };

        setChats((prev) =>
          prev.map((chat) => (chat.id === id ? chatForState : chat)),
        );

        if (activeChatId === id) {
          setActiveChatState(updatedChat);
        }

        // Reload tree to reflect changes (rename, move, etc.)
        await loadChats();
      } catch (error) {
        console.error("Failed to update chat:", error);
        setError(
          error instanceof Error ? error.message : "Failed to update chat",
        );
        throw error;
      }
    },
    [activeChatId, loadChats],
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

  // Load chats when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
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

  const value: ChatsContextType = {
    chats,
    chatsTree,
    activeChat,
    activeChatId,
    isLoading,
    error,
    loadChats,
    createChat,
    updateChat,
    deleteChat,
    setActiveChat,
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
