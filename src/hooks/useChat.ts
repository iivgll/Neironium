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
  const [isThinking, setIsThinking] = useState(false);
  const [showThinkingProcess, setShowThinkingProcess] = useState(false);
  const [hasCompletedThinking, setHasCompletedThinking] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');

  const sendMessage = useCallback(
    async (message: string, attachedFiles?: AttachedFile[]) => {
      if (!message.trim() && (!attachedFiles || attachedFiles.length === 0))
        return;

      // Add user message
      let displayContent = message;
      if (attachedFiles && attachedFiles.length > 0) {
        const filesList = attachedFiles.map((f) => f.name).join(', ');
        displayContent = message
          ? `${message}\n\n📎 Прикрепленные файлы: ${filesList}`
          : `📎 Прикрепленные файлы: ${filesList}`;
      }

      const userMessage: Message = {
        role: 'user',
        content: displayContent,
        timestamp: new Date(),
      };

      // Сохраняем текст размышления для этого сообщения
      const thinkingText = `Пользователь задал интересный вопрос. Позвольте мне проанализировать его и подготовить комплексный ответ.

## Анализ запроса

Мне нужно рассмотреть несколько **ключевых аспектов** вопроса:

1. **Основная тема** - о чём именно спрашивает пользователь
2. **Контекст** - в какой области нужен ответ
3. **Глубина** - насколько детальный ответ требуется

Пользователь может задавать вопросы на различные темы:
- Технические вопросы
- Общие знания
- Креативные задачи
- Аналитика и данные

## Структурирование ответа

Я думаю, лучше всего будет организовать ответ следующим образом:

### План ответа:
1. Начать с общего введения
2. Представить основные концепции
3. Привести примеры и иллюстрации
4. Завершить практическими рекомендациями

Ок, теперь я готов сформулировать исчерпывающий и полезный ответ...`;
      
      // Сразу создаем временное сообщение ассистента с процессом размышления
      const thinkingMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        metadata: {
          hasThinkingProcess: true,
          thinkingText: thinkingText,
          thinkingExpanded: showThinkingProcess
        }
      };
      
      setMessages((prev) => [...prev, userMessage, thinkingMessage]);
      setIsLoading(true);
      
      // Сбрасываем все состояния и сразу показываем размышление
      setIsThinking(true);
      setHasCompletedThinking(false);
      setStreamingResponse('');

      try {
        // Simulate thinking process - показываем процесс размышления 3-4 секунды
        await new Promise((resolve) => setTimeout(resolve, 3500));
        
        // Закрываем процесс размышления, но помечаем как завершенный
        setIsThinking(false);
        setHasCompletedThinking(true);
        
        // Небольшая пауза перед показом ответа
        await new Promise((resolve) => setTimeout(resolve, 500));

        let responseContent = `# Ответ на ваш вопрос

Это **демонстрационный ответ** от нейросети Neuronium. В реальном приложении здесь будет подключено ваше API.

## Возможности системы

Я могу помочь с:
- 💡 Ответами на вопросы
- 📝 Генерацией текста
- 📊 Анализом данных
- 🎨 Креативными задачами

## Пример изображения

![Что такое ИИ](https://beconnected.esafety.gov.au/pluginfile.php/99437/mod_resource/content/2/what-is-ai%20%281%29.jpg)

### Основные преимущества:

1. **Быстрые ответы** - обработка запросов в режиме реального времени
2. **Точность** - использование передовых языковых моделей
3. **Многозадачность** - поддержка различных типов запросов

Моя система размышления позволяет мне тщательно обдумывать каждый ответ перед его предоставлением.`;
        
        if (attachedFiles && attachedFiles.length > 0) {
          responseContent = `📄 **Я вижу, что вы прикрепили ${attachedFiles.length} файл(ов).**\n\n${responseContent}`;
        }

        // Обновляем существующее сообщение ассистента
        setStreamingResponse('');

        // Анимируем появление текста символ за символом
        for (let i = 0; i <= responseContent.length; i++) {
          const currentText = responseContent.slice(0, i);
          setStreamingResponse(currentText);
          
          // Обновляем последнее сообщение
          setMessages((prev) => {
            const updatedMessages = [...prev];
            if (updatedMessages.length > 0) {
              updatedMessages[updatedMessages.length - 1] = {
                ...updatedMessages[updatedMessages.length - 1],
                content: currentText,
                metadata: {
                  ...updatedMessages[updatedMessages.length - 1].metadata,
                  hasThinkingProcess: true,
                  thinkingText: thinkingText,
                  thinkingExpanded: showThinkingProcess
                }
              };
            }
            return updatedMessages;
          });
          
          await new Promise((resolve) => setTimeout(resolve, 20)); // 20ms на символ
        }

        setStreamingResponse('');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Произошла ошибка';
        options.onError?.(new Error(errorMessage));

        // Optionally add error message to chat
        const errorMsg: Message = {
          role: 'assistant',
          content: `Ошибка: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        setIsThinking(false);
      }
    },
    [options],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsThinking(false);
    setShowThinkingProcess(false);
    setHasCompletedThinking(false);
    setStreamingResponse('');
  }, []);

  const toggleThinkingProcess = useCallback(() => {
    setShowThinkingProcess(!showThinkingProcess);
  }, [showThinkingProcess]);

  return {
    messages,
    isLoading,
    model,
    setModel,
    sendMessage,
    clearMessages,
    isThinking,
    showThinkingProcess,
    toggleThinkingProcess,
    hasCompletedThinking,
    streamingResponse,
  };
};
