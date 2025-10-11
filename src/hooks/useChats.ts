"use client";
import { useCallback, useMemo } from "react";
import { Chat } from "@/types/chat";
import { ChatCreate, ChatUpdate } from "@/types/api";
import { useChatsContext } from "@/contexts/ChatsContext";

// Bridge hook to maintain compatibility with existing components
// while using the new ChatsContext for API integration
export function useChats() {
  const {
    chats,
    activeChat,
    activeChatId,
    createChat: createChatAPI,
    updateChat: updateChatAPI,
    deleteChat: deleteChatAPI,
    setActiveChat,
  } = useChatsContext();

  // Convert API ChatRead to local Chat type for compatibility
  const chatsList = useMemo(() => {
    return chats.map(
      (chat): Chat => ({
        id: chat.id,
        title: chat.title || "Untitled Chat",
        parent_id: chat.parent_id,
        model: chat.model,
        temperature: chat.temperature,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        isActive: chat.id === activeChatId,
      }),
    );
  }, [chats, activeChatId]);

  const deleteChat = useCallback(
    (chatId: number) => {
      deleteChatAPI(chatId);
    },
    [deleteChatAPI],
  );

  const addChat = useCallback(
    async (chat: Omit<Chat, "id">) => {
      const chatData: ChatCreate = {
        title: chat.title,
        parent_id: chat.parent_id,
        model: chat.model,
        temperature: chat.temperature,
      };

      const newChat = await createChatAPI(chatData);
      return newChat.id;
    },
    [createChatAPI],
  );

  const updateChat = useCallback(
    (chatId: number, updates: Partial<Chat>) => {
      const updateData: ChatUpdate = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.parent_id !== undefined)
        updateData.parent_id = updates.parent_id;
      if (updates.model !== undefined) updateData.model = updates.model;
      if (updates.temperature !== undefined)
        updateData.temperature = updates.temperature;

      updateChatAPI(chatId, updateData);
    },
    [updateChatAPI],
  );

  const getChat = useCallback(
    (chatId: number) => {
      return chatsList.find((chat) => chat.id === chatId);
    },
    [chatsList],
  );

  // Convert activeChat from API format to local format
  const activeChatFormatted = useMemo(() => {
    if (!activeChat) return null;

    return {
      id: activeChat.id,
      title: activeChat.title || "Untitled Chat",
      parent_id: activeChat.parent_id,
      model: activeChat.model,
      temperature: activeChat.temperature,
      created_at: activeChat.created_at,
      updated_at: activeChat.updated_at,
      isActive: true,
    };
  }, [activeChat]);

  return {
    chatsList,
    deleteChat,
    setActiveChat,
    addChat,
    updateChat,
    getChat,
    activeChat: activeChatFormatted,
    activeChatId,
  };
}
