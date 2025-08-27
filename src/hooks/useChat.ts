import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';
import { AttachedFile } from '@/types/file';

export interface UseChatOptions {
  onError?: (error: Error) => void;
}

export const useChat = (options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>('gpt-4o');

  const sendMessage = useCallback(async (message: string, attachedFiles?: AttachedFile[]) => {
    if (!message.trim() && (!attachedFiles || attachedFiles.length === 0)) return;

    // Add user message
    let displayContent = message;
    if (attachedFiles && attachedFiles.length > 0) {
      const filesList = attachedFiles.map(f => f.name).join(', ');
      displayContent = message ? `${message}\n\n📎 Прикрепленные файлы: ${filesList}` : `📎 Прикрепленные файлы: ${filesList}`;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: displayContent,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // TODO: Replace with actual API integration
      // For now, simulate response with acknowledgment of files if attached
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let responseContent = 'Это демо-ответ. Подключите ваше собственное API для реальных ответов.';
      if (attachedFiles && attachedFiles.length > 0) {
        responseContent = `Я вижу, что вы прикрепили ${attachedFiles.length} файл(ов). ${responseContent}`;
      }
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: responseContent,
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