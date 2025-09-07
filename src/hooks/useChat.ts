import { useState, useCallback, useEffect } from "react";
import { MessageRead } from "@/types/api";
import { apiClient } from "@/utils/apiClient";
import { streamHandler, StreamEvent } from "@/utils/streamHandler";

export interface UseChatOptions {
  onError?: (error: Error) => void;
}

export const useChat = (chatId?: number, options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>("gpt-4o");
  const [isThinking, setIsThinking] = useState(false);
  const [showThinkingProcess, setShowThinkingProcess] = useState(false);
  const [hasCompletedThinking, setHasCompletedThinking] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");

  // Очищаем сообщения при изменении chatId
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setError(null);
      setIsStreaming(false);
    }
  }, [chatId]);

  const loadMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getMessages(chatId);
      setMessages(response.items);
    } catch (error) {
      console.error("Failed to load messages:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load messages";
      setError(errorMessage);
      options.onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [chatId, options.onError]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!chatId || !message.trim()) return;

      const clientMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      try {
        console.log("🚀 Starting sendMessage, setting isStreaming to TRUE");
        setIsStreaming(true);
        setError(null);
        console.log(
          "📊 Current state - isStreaming:",
          true,
          "messages count:",
          messages.length,
        );

        // Добавляем пользовательское сообщение сразу
        const userMessage: MessageRead = {
          id: Date.now(), // Временный ID
          chat_id: chatId,
          role: "user",
          content: message.trim(),
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Создаем сообщение ассистента сразу для отображения процесса
        const assistantMessage: MessageRead = {
          id: Date.now() + 1, // Временный ID
          chat_id: chatId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage];
          console.log(
            "💭 Added assistant message, total messages:",
            newMessages.length,
            "assistant content:",
            assistantMessage.content || "(empty)",
          );
          return newMessages;
        });
        console.log("💭 Starting stream after delay...");

        // Обрабатываем stream
        await streamHandler.handleStream(
          chatId,
          message,
          (event: StreamEvent) => {
            switch (event.type) {
              case "message_start":
                console.log("📝 Stream started");
                break;

              case "message_delta":
                console.log("📝 Stream delta received:", event.data);
                // Обновляем контент ассистента
                if (event.data?.content) {
                  const newContent = event.data.content;
                  console.log("✏️ Adding content:", newContent);

                  // Для всех строк добавляем сразу (упрощаем)
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                      lastMessage.content += newContent;
                      console.log(
                        "📝 Updated message content length:",
                        lastMessage.content.length,
                        "isStreaming:",
                        true,
                      );
                    }
                    return newMessages;
                  });
                }
                break;

              case "message_end":
                console.log("📝 Stream ended");
                setIsStreaming(false); // Останавливаем стриминг здесь
                // TODO: Можно перезагрузить сообщения для актуальных ID, но это сбрасывает состояние
                // loadMessages();
                break;

              case "error":
                console.error("Stream error:", event.error);
                setError(event.error || "Streaming error occurred");
                setIsStreaming(false); // Останавливаем стриминг при ошибке
                // Удаляем незавершенное сообщение ассистента
                setMessages((prev) => prev.slice(0, -1));
                break;
            }
          },
          clientMessageId,
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        setError(errorMessage);
        setIsStreaming(false); // Останавливаем стриминг при ошибке
        // Удаляем добавленные сообщения при ошибке
        setMessages((prev) => prev.slice(0, -2));
        options.onError?.(new Error(errorMessage));
      } finally {
        console.log("🏁 Finishing sendMessage (not changing isStreaming here)");
        // setIsStreaming(false) теперь вызывается в message_end или error
      }
    },
    [chatId, loadMessages, options.onError],
  );

  const deleteMessage = useCallback(
    async (messageId: number) => {
      if (!chatId) return;

      try {
        await apiClient.deleteMessage(chatId, messageId);
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (error) {
        console.error("Failed to delete message:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete message";
        setError(errorMessage);
        options.onError?.(new Error(errorMessage));
      }
    },
    [chatId, options.onError],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsThinking(false);
    setShowThinkingProcess(false);
    setHasCompletedThinking(false);
    setStreamingResponse("");
    setError(null);
  }, []);

  const toggleThinkingProcess = useCallback(() => {
    setShowThinkingProcess(!showThinkingProcess);
  }, [showThinkingProcess]);

  return {
    messages,
    setMessages,
    isLoading,
    isStreaming,
    setIsStreaming,
    error,
    setError,
    model,
    setModel,
    sendMessage,
    loadMessages,
    deleteMessage,
    clearMessages,
    isThinking,
    showThinkingProcess,
    toggleThinkingProcess,
    hasCompletedThinking,
    streamingResponse,
  };
};
