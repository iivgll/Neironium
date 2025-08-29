'use client';
import { useState, useCallback, useMemo } from 'react';
import { Chat } from '@/types/chat';

// Mock data moved to hook for better separation
const INITIAL_CHATS: Chat[] = [
  { id: 'chat-1', title: 'Создание статей для Хабра', isActive: true },
  { id: 'chat-2', title: 'Планирование проекта' },
  { id: 'chat-3', title: 'Дизайн системы' },
  { id: 'chat-4', title: 'Разработка API' },
  { id: 'chat-5', title: 'Тестирование' },
];

export function useChats() {
  const [chatsList, setChatsList] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>('chat-1');

  const deleteChat = useCallback((chatId: string) => {
    setChatsList((prev) => prev.filter((chat) => chat.id !== chatId));
    // Clear active chat if it's being deleted
    setActiveChatId((prev) => (prev === chatId ? null : prev));
  }, []);

  const setActiveChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setChatsList((prev) =>
      prev.map((chat) => ({
        ...chat,
        isActive: chat.id === chatId,
      })),
    );
  }, []);

  const addChat = useCallback((chat: Omit<Chat, 'id'>) => {
    const newChat: Chat = {
      ...chat,
      id: `chat-${Date.now()}`,
    };
    setChatsList((prev) => [...prev, newChat]);
    return newChat.id;
  }, []);

  const updateChat = useCallback((chatId: string, updates: Partial<Chat>) => {
    setChatsList((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat)),
    );
  }, []);

  const getChat = useCallback(
    (chatId: string) => {
      return chatsList.find((chat) => chat.id === chatId);
    },
    [chatsList],
  );

  // Optimized active chat lookup using activeChatId
  const activeChat = useMemo(() => {
    return activeChatId
      ? chatsList.find((chat) => chat.id === activeChatId)
      : null;
  }, [chatsList, activeChatId]);

  return {
    chatsList,
    deleteChat,
    setActiveChat,
    addChat,
    updateChat,
    getChat,
    activeChat,
    activeChatId,
  };
}
