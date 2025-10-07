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

        let currentEvent = "";

        for (const line of lines) {
          if (line.trim() === "") {
            // Пустая строка - завершение SSE события
            currentEvent = "";
            continue;
          }

          console.log("📦 Processing line:", line);

          // Обрабатываем SSE формат
          if (line.startsWith("event:")) {
            // Это строка с типом события
            currentEvent = line.substring(6).trim();
            console.log("📦 SSE event type:", currentEvent);
            continue;
          } else if (line.startsWith("data:")) {
            // Это строка с данными
            const data = line.substring(5).trim();
            console.log("📦 SSE data:", data, "event:", currentEvent);

            try {
              const parsedData = JSON.parse(data);
              console.log("📦 Parsed SSE data:", parsedData);

              // Обрабатываем разные типы событий от API
              switch (currentEvent) {
                case "message.created":
                  // Сообщение создано
                  console.log(
                    "📦 User message created with ID:",
                    parsedData.user_message_id,
                  );
                  onEvent({ type: "message_start" });
                  break;

                case "token":
                  // Получен токен с текстом
                  if (parsedData.delta) {
                    onEvent({
                      type: "message_delta",
                      data: { content: parsedData.delta },
                    });
                  }
                  break;

                case "done":
                  // Стриминг завершен
                  console.log(
                    "📦 Assistant message completed with ID:",
                    parsedData.assistant_message_id,
                  );
                  onEvent({ type: "message_end" });
                  break;

                case "context":
                  // Контекстная информация, просто логируем
                  console.log("📦 Context:", parsedData);
                  break;

                default:
                  console.log("📦 Unknown event type:", currentEvent);
              }
            } catch (parseError) {
              console.log("📦 Failed to parse SSE data as JSON:", parseError);
            }
          } else {
            // Неизвестный формат строки, игнорируем
            console.log("📦 Unknown line format, ignoring:", line);
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
