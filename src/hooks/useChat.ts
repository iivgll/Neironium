import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';

export interface UseChatOptions {
  onError?: (error: Error) => void;
}

export const useChat = (options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>('gpt-4o');

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // TODO: Replace with actual API integration
      // Simulate response for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: 'Это демо-ответ. Подключите ваше собственное API для реальных ответов.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
      options.onError?.(new Error(errorMessage));
      
      // Optionally add error message to chat
      const errorMsg: Message = {
        role: 'assistant',
        content: `Ошибка: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    model,
    setModel,
    sendMessage,
    clearMessages,
  };
};