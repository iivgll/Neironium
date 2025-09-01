'use client';
import React, { useRef, useCallback, useState } from 'react';
import { Box, Flex, VStack } from '@chakra-ui/react';
import NeuroniumChatInput from '@/components/chat/NeuroniumChatInput';
import NeuroniumNavbar from '@/components/navbar/NeuroniumNavbar';
import MessageBoxChat from '@/components/messages/MessageBox';
import UserMessage from '@/components/messages/UserMessage';
import ThinkingProcess from '@/components/chat/ThinkingProcess';
import MessageActions from '@/components/messages/MessageActions';
import { useChat } from '@/hooks/useChat';
import { useKeyboardHandler } from '@/hooks/useKeyboardHandler';
import { COLORS } from '@/theme/colors';
import { useTelegram } from '@/contexts/TelegramContext';

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const { displayName, user, isTelegramEnvironment } = useTelegram();
  const [messageThinkingStates, setMessageThinkingStates] = useState<{
    [key: number]: boolean;
  }>({});

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

  const handleError = useCallback((error: Error) => {
    console.error('Chat error:', error);
    // Handle error display here if needed
  }, []);

  const {
    messages,
    isLoading,
    model,
    setModel,
    sendMessage,
    isThinking,
    showThinkingProcess,
    toggleThinkingProcess,
  } = useChat({
    onError: handleError,
  });

  const toggleMessageThinking = useCallback((index: number) => {
    setMessageThinkingStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      else if (messages[currentCount - 1]?.role === 'user') {
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
      <NeuroniumNavbar model={model} onModelChange={setModel} />
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
          px={{ base: '16px', md: '32px' }}
          maxW="1200px"
          w="100%"
          mx="auto"
          pb={isKeyboardVisible ? '350px' : '240px'}
          onScroll={handleScroll}
          style={getContainerStyle()}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          {/* Welcome Screen - показывается когда нет сообщений */}
          {messages.length === 0 && (
            <Flex
              h="100%"
              direction="column"
              align="center"
              justify="center"
              textAlign="center"
            >
              <div
                style={{
                  fontSize: '2.25rem',
                  marginBottom: '12px',
                  backgroundImage: COLORS.GRADIENT_PRIMARY,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                Привет, {displayName}
                <br /> v 1.0.0
              </div>
            </Flex>
          )}

          {/* Messages Area */}
          {messages.length > 0 && (
            <VStack spacing="16px" py="20px" pb="30px" w="100%">
              {messages.map((message, index) => {
                const isLastAssistantMessage =
                  message.role === 'assistant' && index === messages.length - 1;

                if (message.role === 'assistant') {
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
                        direction="column"
                        position="relative"
                      >
                        <Box
                          maxW={{ base: '100%', md: '70%' }}
                          width={{ base: '100%', md: 'auto' }}
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

                          {/* Ответ ассистента - показываем только если есть контент */}
                          {message.content && (
                            <>
                              <Box
                                mt={
                                  hasThinking
                                    ? { base: '-15px', md: '-30px' }
                                    : '0'
                                }
                              >
                                <MessageBoxChat output={message.content} />
                              </Box>
                              <Box pl={{ base: '16px', md: '22px' }}>
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
                                            .find((m) => m.role === 'user');
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
                      maxWidth={{ base: '100%', md: '70%' }}
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
          px={{ base: '16px', md: '32px' }}
          py="12px"
          pb="calc(12px + env(safe-area-inset-bottom, 0px))"
          minH="100px"
          backdropFilter="blur(10px)"
          zIndex={10}
          {...getFixedBottomStyle()}
        >
          <Box maxW="1200px" mx="auto">
            <NeuroniumChatInput
              onSend={sendMessage}
              isLoading={isLoading}
              placeholder={
                messages.length === 0
                  ? 'Спроси любой вопрос'
                  : 'Продолжить разговор...'
              }
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
