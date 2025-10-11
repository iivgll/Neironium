"use client";
import React, { useRef, useCallback, useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { Box, Flex, VStack } from "@chakra-ui/react";
import NeuroniumChatInput from "@/components/chat/NeuroniumChatInput";
import NeuroniumNavbar from "@/components/navbar/NeuroniumNavbar";
import ChatTreeView from "@/components/chat/ChatTreeView";
import MessageBoxChat from "@/components/messages/MessageBox";
import UserMessage from "@/components/messages/UserMessage";
import ThinkingProcess from "@/components/chat/ThinkingProcess";
import MessageActions from "@/components/messages/MessageActions";
import NeuroniumAvatar from "@/components/messages/NeuroniumAvatar";
import { useChat } from "@/hooks/useChat";
import { useKeyboardHandler } from "@/hooks/useKeyboardHandler";
import { COLORS } from "@/theme/colors";
import { useTelegram } from "@/contexts/TelegramContext";
import { useChatsContext } from "@/contexts/ChatsContext";
import { useChatDetails } from "@/contexts/ChatDetailsContext";
import { streamHandler, StreamEvent } from "@/utils/streamHandler";
import { MessageRead, FileRead } from "@/types/api";
import { apiClient } from "@/utils/apiClient";
import { useDisclosure } from "@chakra-ui/react";
import DeleteChatModal from "@/components/modals/DeleteChatModal";
import RenameChatModal from "@/components/modals/RenameChatModal";
import NewChatModal from "@/components/modals/NewChatModal";
import AddFileModal from "@/components/modals/AddFileModal";

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const { displayName, user, isTelegramEnvironment } = useTelegram();
  const {
    activeChatId,
    loadMessages: loadChatMessages,
    createChat,
    chatsTree,
    updateChat: updateChatInContext,
    deleteChat: deleteChatInContext,
    setActiveChat,
  } = useChatsContext();
  const { selectedDetailsChat, setSelectedDetailsChat } = useChatDetails();
  const [messageThinkingStates, setMessageThinkingStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [isAutoCreatingChat, setIsAutoCreatingChat] = useState(false);

  // Modal states for chat details actions
  const {
    isOpen: isDeleteChatOpen,
    onOpen: onDeleteChatOpen,
    onClose: onDeleteChatClose,
  } = useDisclosure();
  const {
    isOpen: isRenameChatOpen,
    onOpen: onRenameChatOpen,
    onClose: onRenameChatClose,
  } = useDisclosure();
  const {
    isOpen: isNewChatOpen,
    onOpen: onNewChatOpen,
    onClose: onNewChatClose,
  } = useDisclosure();
  const {
    isOpen: isAddFileOpen,
    onOpen: onAddFileOpen,
    onClose: onAddFileClose,
  } = useDisclosure();

  const [parentChatForNew, setParentChatForNew] = useState<{ id: number; title: string } | null>(null);
  const [chatToRename, setChatToRename] = useState<{ id: number; title: string } | null>(null);
  const [chatToDelete, setChatToDelete] = useState<{ id: number; title: string } | null>(null);

  // Files state
  const [chatFiles, setChatFiles] = useState<FileRead[]>([]);

  // Load chat files when modal opens or active chat changes
  const loadChatFiles = useCallback(async () => {
    if (activeChatId) {
      try {
        const response = await apiClient.getChatFiles(activeChatId);
        setChatFiles(response.items);
      } catch (error) {
        console.error("Failed to load chat files:", error);
        setChatFiles([]);
      }
    }
  }, [activeChatId]);

  // Load files when active chat changes
  useEffect(() => {
    loadChatFiles();
  }, [loadChatFiles]);

  // File upload handler
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!activeChatId) return;

    try {
      await apiClient.uploadChatFiles(activeChatId, files);
      await loadChatFiles();
    } catch (error) {
      console.error("Failed to upload files:", error);
      throw error;
    }
  }, [activeChatId, loadChatFiles]);

  // File delete handler
  const handleFileDelete = useCallback(async (fileId: number) => {
    if (!activeChatId) return;

    try {
      await apiClient.deleteChatFile(activeChatId, fileId);
      await loadChatFiles();
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    }
  }, [activeChatId, loadChatFiles]);

  // Используем хук для управления клавиатурой
  const { getFixedBottomStyle, getContainerStyle, isKeyboardVisible } =
    useKeyboardHandler({
      enableScrollIntoView: false, // Управляем прокруткой сами
      scrollOffset: 0,
    });

  // Initialize Telegram data
  React.useEffect(() => {
    // Telegram data initialized
  }, [displayName, user, isTelegramEnvironment]);

  // Функция для генерации названия чата из сообщения
  const generateChatTitle = useCallback((message: string): string => {
    // Берем первые 3-5 слов сообщения как название чата
    const words = message.trim().split(/\s+/);
    const titleWords = words.slice(0, Math.min(5, words.length));
    let title = titleWords.join(" ");

    // Если заголовок слишком длинный, обрезаем до 50 символов
    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    // Убираем знаки препинания в конце
    title = title.replace(/[.,!?;:]$/, "");

    return title || "Новый чат";
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error("Chat error:", error);
    // Handle error display here if needed
  }, []);

  const {
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
    isThinking,
    showThinkingProcess,
    toggleThinkingProcess,
  } = useChat(activeChatId || undefined, {
    onError: handleError,
  });

  // Memoized callback to prevent infinite renders in ModelSelector
  const handleModelChange = useCallback(
    (newModel: string) => {
      setModel(newModel);
    },
    [setModel],
  );

  // Load messages and chat info when active chat changes (но не после автосоздания)
  React.useEffect(() => {
    if (activeChatId && !isAutoCreatingChat) {
      loadMessages();

      // Load chat info to get current model
      const loadChatInfo = async () => {
        try {
          const chatInfo = await apiClient.getChat(activeChatId);
          if (chatInfo.model) {
            setModel(chatInfo.model);
          }
        } catch (error) {
          console.error("Failed to load chat info:", error);
        }
      };
      loadChatInfo();

      // Скрываем детали чата при переключении на другой чат
      setSelectedDetailsChat(null);
    } else if (!activeChatId && !isAutoCreatingChat) {
      // Очищаем сообщения когда нет активного чата
      // Проверяем, что сообщения еще не пустые, чтобы избежать лишних обновлений
      setMessages((prev) => (prev.length > 0 ? [] : prev));
      // НЕ закрываем детали чата - они могут быть открыты намеренно (клик на плюсик)
      // setSelectedDetailsChat(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId, isAutoCreatingChat]); // loadMessages и setMessages намеренно исключены

  // Функция для прямой отправки сообщения в новый чат
  const sendMessageDirectly = useCallback(
    async (chatId: number, message: string) => {
      if (!message.trim()) return;

      const clientMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      try {
        console.log("🚀 Sending message directly to new chat:", chatId);
        setIsStreaming(true);
        setError(null);

        // Добавляем пользовательское сообщение сразу
        const userMessage: MessageRead = {
          id: Date.now(), // Временный ID
          chat_id: chatId,
          role: "user",
          content: message.trim(),
          created_at: new Date().toISOString(),
        };

        setMessages((prev: MessageRead[]) => [...prev, userMessage]);

        // Создаем сообщение ассистента сразу для отображения процесса
        const assistantMessage: MessageRead = {
          id: Date.now() + 1, // Временный ID
          chat_id: chatId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        };

        setMessages((prev: MessageRead[]) => [...prev, assistantMessage]);

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

                  // Используем flushSync для немедленной отрисовки каждого chunk'а
                  flushSync(() => {
                    setMessages((prev: MessageRead[]) => {
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
                  });
                }
                break;

              case "message_end":
                console.log("📝 Stream ended");
                setIsStreaming(false);
                setIsAutoCreatingChat(false); // Сбрасываем флаг после завершения стриминга
                break;

              case "error":
                console.error("Stream error:", event.error);
                setError(event.error || "Streaming error occurred");
                setIsStreaming(false);
                setIsAutoCreatingChat(false); // Сбрасываем флаг при ошибке
                // Удаляем незавершенное сообщение ассистента
                setMessages((prev: MessageRead[]) => prev.slice(0, -1));
                break;
            }
          },
          clientMessageId,
        );
      } catch (error) {
        console.error("Failed to send message directly:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        setError(errorMessage);
        setIsStreaming(false);
        setIsAutoCreatingChat(false); // Сбрасываем флаг при ошибке
        // Удаляем добавленные сообщения при ошибке
        setMessages((prev: MessageRead[]) => prev.slice(0, -2));
        handleError(new Error(errorMessage));
      }
    },
    [handleError, setMessages, setIsStreaming, setError],
  );

  // Обертка для sendMessage с автосозданием чата
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      // Если нет активного чата, создаем новый и отправляем сообщение напрямую
      if (!activeChatId) {
        try {
          setIsAutoCreatingChat(true);
          const chatTitle = generateChatTitle(message);
          const newChat = await createChat({
            title: chatTitle,
          });
          console.log(
            "✨ Auto-created new chat:",
            chatTitle,
            "ID:",
            newChat.id,
          );

          // Отправляем сообщение напрямую через API, используя новый chatId
          await sendMessageDirectly(newChat.id, message);
        } catch (error) {
          console.error("Failed to auto-create chat:", error);
          setIsAutoCreatingChat(false);
          handleError(
            error instanceof Error ? error : new Error("Failed to create chat"),
          );
        }
      } else {
        // Если чат уже есть, отправляем сообщение как обычно
        sendMessage(message);
      }
    },
    [
      activeChatId,
      generateChatTitle,
      createChat,
      sendMessage,
      handleError,
      sendMessageDirectly,
    ],
  );

  const toggleMessageThinking = useCallback((index: number) => {
    setMessageThinkingStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle scroll events to detect user scrolling
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // Уменьшен порог для большей чувствительности

    // Если пользователь прокрутил вверх от низа
    setIsUserScrolling(!isAtBottom);
  }, []);

  // Отслеживаем количество сообщений для определения новых сообщений
  const prevMessageCountRef = useRef(messages.length);

  // Scroll to bottom when NEW messages appear, but not during content streaming
  React.useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = messages.length;

    // Новое сообщение добавлено (не стриминг контента)
    if (currentCount > prevCount) {
      // При первом сообщении всегда прокручиваем
      if (currentCount === 1) {
        scrollToBottom();
      }
      // При новом сообщении пользователя всегда прокручиваем
      else if (messages[currentCount - 1]?.role === "user") {
        setIsUserScrolling(false);
        scrollToBottom();
      }
      // При новом сообщении ассистента прокручиваем только если пользователь внизу
      else if (!isUserScrolling) {
        scrollToBottom();
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages.length, messages, scrollToBottom, isUserScrolling]);

  // НЕ прокручиваем при изменении контента существующих сообщений (стриминг)
  // Это позволяет пользователю свободно прокручивать во время генерации

  return (
    <Box
      h="100%"
      bg={COLORS.BG_PRIMARY}
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <NeuroniumNavbar
        model={model}
        onModelChange={handleModelChange}
        onAddFile={onAddFileOpen}
        chatId={activeChatId || undefined}
        onToggleChatDetails={() => {
          if (selectedDetailsChat) {
            // Если детали уже открыты - закрываем
            console.log("Closing chat details");
            setSelectedDetailsChat(null);
          } else if (activeChatId) {
            console.log("Active chat ID:", activeChatId);
            console.log("Chats tree:", chatsTree);

            // Функция для поиска чата в дереве
            const findChat = (chats: any[], id: number): any => {
              for (const chat of chats) {
                if (chat.id === id) return chat;
                if (chat.children) {
                  const found = findChat(chat.children, id);
                  if (found) return found;
                }
              }
              return null;
            };

            // Функция для поиска корневого родителя - ищет в каком корневом чате находится целевой ID
            const findRootParent = (chats: any[], targetId: number): any => {
              for (const rootChat of chats) {
                // Проверяем, находится ли целевой чат в этом дереве
                const foundInTree = findChat([rootChat], targetId);
                if (foundInTree) {
                  // Если нашли - возвращаем корневой чат
                  return rootChat;
                }
              }
              return null;
            };

            // Ищем корневого родителя для активного чата
            const rootParent = findRootParent(chatsTree, activeChatId);
            console.log("Found root parent:", rootParent);

            if (rootParent) {
              setSelectedDetailsChat(rootParent);
              console.log("Set selected details chat to:", rootParent);
            } else {
              console.log("No root parent found for chat ID:", activeChatId);
            }
          } else {
            console.log("No active chat ID");
          }
        }}
        isChatDetailsVisible={!!selectedDetailsChat}
      />
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        position="relative"
        pt="60px"
        overflow="hidden"
      >
        {/* Chat Container */}
        <Box
          ref={chatContainerRef}
          flex="1"
          overflowY="auto"
          px={{ base: "16px", md: "32px" }}
          maxW="1200px"
          w="100%"
          mx="auto"
          pb={isKeyboardVisible ? "350px" : "240px"}
          onScroll={handleScroll}
          style={getContainerStyle()}
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          {/* Welcome Screen / Chat Tree */}
          {selectedDetailsChat ? (
            // Показываем дерево чатов когда нажали на кнопку (независимо от сообщений)
            <ChatTreeView
                  rootChat={selectedDetailsChat}
                  onChatClick={(chatId: number) => {
                    setActiveChat(chatId);
                  }}
                  onRenameChat={(chatId: number) => {
                    const findChat = (chats: any[], id: number): any => {
                      for (const chat of chats) {
                        if (chat.id === id) return chat;
                        if (chat.children) {
                          const found = findChat(chat.children, id);
                          if (found) return found;
                        }
                      }
                      return null;
                    };
                    const chat = findChat(chatsTree, chatId);
                    if (chat) {
                      setChatToRename({ id: chat.id, title: chat.title || "" });
                      onRenameChatOpen();
                    }
                  }}
                  onDeleteChat={(chatId: number) => {
                    const findChat = (chats: any[], id: number): any => {
                      for (const chat of chats) {
                        if (chat.id === id) return chat;
                        if (chat.children) {
                          const found = findChat(chat.children, id);
                          if (found) return found;
                        }
                      }
                      return null;
                    };
                    const chat = findChat(chatsTree, chatId);
                    if (chat) {
                      setChatToDelete({ id: chat.id, title: chat.title || "" });
                      onDeleteChatOpen();
                    }
                  }}
                  onCreateSubchat={(parentChatId: number) => {
                    const findChat = (chats: any[], id: number): any => {
                      for (const chat of chats) {
                        if (chat.id === id) return chat;
                        if (chat.children) {
                          const found = findChat(chat.children, id);
                          if (found) return found;
                        }
                      }
                      return null;
                    };
                    const chat = findChat(chatsTree, parentChatId);
                    if (chat) {
                      setParentChatForNew({
                        id: chat.id,
                        title: chat.title || "Чат",
                      });
                      onNewChatOpen();
                    }
                  }}
                  activeChatId={activeChatId}
                />
              ) : messages.length === 0 && (
                // Показываем приветствие только если нет сообщений и детали закрыты
                <Flex
                  h="100%"
                  direction="column"
                  align="center"
                  justify="center"
                  textAlign="center"
                >
                  <div
                    style={{
                      fontSize: "2.25rem",
                      marginBottom: "12px",
                      backgroundImage: COLORS.GRADIENT_PRIMARY,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 700,
                    }}
                  >
                    Привет, {displayName}
                    <br /> v 1.0.2
                  </div>
                </Flex>
              )}

          {/* Messages Area */}
          {messages.length > 0 && (
            <VStack spacing="16px" py="20px" pb="30px" w="100%">
              {messages.map((message, index) => {
                console.log(
                  "🎨 Rendering message",
                  index,
                  "role:",
                  message.role,
                  "content length:",
                  message.content?.length || 0,
                );
                const isLastAssistantMessage =
                  message.role === "assistant" && index === messages.length - 1;

                if (message.role === "assistant") {
                  const hasThinking = message.metadata?.hasThinkingProcess;
                  const thinkingText = message.metadata?.thinkingText;
                  // Для текущего сообщения используем глобальное состояние, для старых - локальное
                  const isExpanded =
                    isLastAssistantMessage && isThinking
                      ? showThinkingProcess
                      : (messageThinkingStates[index] ?? false);

                  return (
                    <React.Fragment key={index}>
                      {/* Объединенный контейнер для размышления и ответа */}
                      <Flex
                        w="100%"
                        justify="flex-start"
                        direction="row"
                        position="relative"
                        alignItems="flex-start"
                        gap={{ base: "4px", md: "8px" }}
                      >
                        {/* Анимация слева от всего контента */}
                        <Box flexShrink={0} pt={0}>
                          <NeuroniumAvatar
                            isAnimating={isLastAssistantMessage}
                            size={80}
                          />
                        </Box>

                        <Box
                          maxW={{ base: "calc(100% - 90px)", md: "70%" }}
                          width={{ base: "100%", md: "auto" }}
                        >
                          {/* Показываем ThinkingProcess для всех сообщений с процессом размышления */}
                          {hasThinking && (
                            <ThinkingProcess
                              isThinking={isLastAssistantMessage && isThinking}
                              isExpanded={isExpanded}
                              onToggle={() => {
                                if (isLastAssistantMessage && isThinking) {
                                  toggleThinkingProcess();
                                } else {
                                  toggleMessageThinking(index);
                                }
                              }}
                              hasCompleted={
                                !isLastAssistantMessage || !isThinking
                              }
                              thinkingText={thinkingText}
                            />
                          )}

                          {/* Ответ ассистента - показываем всегда для последнего сообщения или если есть контент */}
                          {(isLastAssistantMessage || message.content) && (
                            <>
                              <Box
                                mt={
                                  hasThinking
                                    ? { base: "-8px", md: "-30px" }
                                    : { base: "-4px", md: "0" }
                                }
                              >
                                <MessageBoxChat
                                  output={message.content}
                                  isStreaming={
                                    isLastAssistantMessage && isStreaming
                                  }
                                  isLastMessage={isLastAssistantMessage}
                                />
                              </Box>
                              {message.content && (
                                <Box>
                                  <MessageActions
                                    content={message.content}
                                    isLastMessage={isLastAssistantMessage}
                                    onRegenerate={
                                      isLastAssistantMessage
                                        ? () => {
                                            // Перегенерация последнего сообщения
                                            const lastUserMessage = messages
                                              .slice(0, -1)
                                              .reverse()
                                              .find((m) => m.role === "user");
                                            if (lastUserMessage) {
                                              sendMessage(
                                                lastUserMessage.content,
                                              );
                                            }
                                          }
                                        : undefined
                                    }
                                  />
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      </Flex>
                    </React.Fragment>
                  );
                } else {
                  return (
                    <UserMessage
                      key={index}
                      content={message.content}
                      maxWidth={{ base: "100%", md: "70%" }}
                    />
                  );
                }
              })}

              <div ref={messagesEndRef} />
            </VStack>
          )}
        </Box>

        {/* Fixed Input Area at Bottom */}
        <Box
          position="absolute"
          left="0"
          right="0"
          bg={COLORS.BG_PRIMARY}
          px={{ base: "16px", md: "32px" }}
          py="12px"
          pb="calc(12px + env(safe-area-inset-bottom, 0px))"
          minH="100px"
          backdropFilter="blur(10px)"
          zIndex={10}
          {...getFixedBottomStyle()}
        >
          <Box maxW="1200px" mx="auto">
            <NeuroniumChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              hasMessages={messages.length > 0}
              placeholder={
                messages.length === 0
                  ? "Спроси любой вопрос"
                  : "Продолжить разговор..."
              }
            />
          </Box>
        </Box>
      </Box>

      {/* Modals for chat details actions */}
      {selectedDetailsChat && (
        <>
          <DeleteChatModal
            isOpen={isDeleteChatOpen}
            onClose={() => {
              setChatToDelete(null);
              onDeleteChatClose();
            }}
            chatTitle={chatToDelete?.title || ""}
            onConfirm={async () => {
              if (chatToDelete) {
                await deleteChatInContext(chatToDelete.id);
                setChatToDelete(null);
                setSelectedDetailsChat(null);
              }
              onDeleteChatClose();
            }}
          />
          <RenameChatModal
            isOpen={isRenameChatOpen}
            onClose={() => {
              setChatToRename(null);
              onRenameChatClose();
            }}
            currentName={chatToRename?.title || ""}
            onRename={async (newTitle) => {
              if (chatToRename) {
                await updateChatInContext(chatToRename.id, { title: newTitle });
                setChatToRename(null);
              }
              onRenameChatClose();
            }}
          />
          <NewChatModal
            isOpen={isNewChatOpen}
            onClose={() => {
              setParentChatForNew(null);
              onNewChatClose();
            }}
            parentChatId={parentChatForNew?.id}
            parentChatTitle={parentChatForNew?.title}
          />
        </>
      )}

      {/* Add File Modal */}
      <AddFileModal
        isOpen={isAddFileOpen}
        onClose={onAddFileClose}
        chatId={activeChatId || undefined}
        files={chatFiles}
        onFilesChange={loadChatFiles}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
        onUrlAdd={(url) => {
          console.log("URL added:", url);
          // TODO: Implement URL add logic
        }}
      />
    </Box>
  );
}
