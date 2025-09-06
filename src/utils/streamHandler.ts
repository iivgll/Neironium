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

        for (const line of lines) {
          if (line.trim() === "") continue;

          console.log("📦 Processing line:", line);

          try {
            // Предполагаем, что каждая строка - это JSON объект
            const eventData = JSON.parse(line);
            console.log("📦 Parsed eventData:", eventData);
            onEvent({
              type: eventData.type || "message_delta",
              data: eventData.data || eventData, // Если data не существует, используем весь объект
            });
          } catch (parseError) {
            console.log("📦 JSON parse failed, trying SSE format");
            // Если не JSON, обрабатываем как обычный текст
            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              console.log("📦 SSE data:", data);
              try {
                const parsedData = JSON.parse(data);
                console.log("📦 Parsed SSE data:", parsedData);
                onEvent({
                  type: "message_delta",
                  data: parsedData,
                });
              } catch {
                console.log("📦 Using raw SSE data as content");
                onEvent({
                  type: "message_delta",
                  data: { content: data },
                });
              }
            } else {
              // Если это просто текст, используем как контент
              console.log("📦 Using line as plain content");
              onEvent({
                type: "message_delta",
                data: { content: line },
              });
            }
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
