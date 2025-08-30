'use client';
import React, { useRef, useCallback, useState } from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import NeuroniumChatInput from '@/components/chat/NeuroniumChatInput';
import NeuroniumNavbar from '@/components/navbar/NeuroniumNavbar';
import MessageBoxChat from '@/components/messages/MessageBox';
import UserMessage from '@/components/messages/UserMessage';
import ThinkingProcess from '@/components/chat/ThinkingProcess';
import { useChat } from '@/hooks/useChat';
import { COLORS } from '@/theme/colors';
import { useTelegram } from '@/contexts/TelegramContext';

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { displayName, user, isTelegramEnvironment } = useTelegram();
  const [messageThinkingStates, setMessageThinkingStates] = useState<{[key: number]: boolean}>({});

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
    hasCompletedThinking,
    streamingResponse
  } = useChat({
    onError: handleError,
  });
  
  const toggleMessageThinking = useCallback((index: number) => {
    setMessageThinkingStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
          flex="1"
          overflowY="auto"
          px={{ base: '16px', md: '32px' }}
          maxW="1200px"
          w="100%"
          mx="auto"
          pb="160px"
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
              </div>
            </Flex>
          )}

          {/* Messages Area */}
          {messages.length > 0 && (
            <VStack spacing="16px" py="20px" w="100%">
              {messages.map((message, index) => {
                const isLastAssistantMessage = message.role === 'assistant' && 
                  index === messages.length - 1;
                
                if (message.role === 'assistant') {
                  const hasThinking = message.metadata?.hasThinkingProcess;
                  const thinkingText = message.metadata?.thinkingText;
                  // Для текущего сообщения используем глобальное состояние, для старых - локальное
                  const isExpanded = isLastAssistantMessage && isThinking 
                    ? showThinkingProcess 
                    : (messageThinkingStates[index] ?? false);
                  
                  return (
                    <React.Fragment key={index}>
                      {/* Объединенный контейнер для размышления и ответа */}
                      <Flex w="100%" justify="flex-start" direction="column" position="relative">
                        <Box maxW="70%">
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
                              hasCompleted={!isLastAssistantMessage || !isThinking}
                              thinkingText={thinkingText}
                            />
                          )}
                          
                          {/* Ответ ассистента - показываем только если есть контент */}
                          {message.content && (
                            <Box mt={hasThinking ? "-30px" : "0"}>
                              <MessageBoxChat output={message.content} />
                            </Box>
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
                      maxWidth="70%"
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
          bottom="0"
          left="0"
          right="0"
          bg={COLORS.BG_PRIMARY}
          px={{ base: '16px', md: '32px' }}
          py="12px"
          backdropFilter="blur(10px)"
          zIndex={10}
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
