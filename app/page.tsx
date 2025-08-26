'use client';
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { SidebarContext } from '@/contexts/SidebarContext';
import NeuroniumChatInput from '@/components/chat/NeuroniumChatInput';
import NeuroniumNavbar from '@/components/navbar/NeuroniumNavbar';
import MessageBoxChat from '@/components/MessageBox';
import { MdAutoAwesome } from 'react-icons/md';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>('gpt-4o');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dark theme colors only
  const bgColor = '#151515';
  const cardBg = '#343434'; // neuronium.background.secondary
  const textColor = '#ffffff'; // neuronium.text.primary
  const textSecondary = '#8a8b8c'; // neuronium.text.secondary
  const borderColor = '#343434'; // neuronium.border.primary
  const accentColor = '#8854f3'; // neuronium.accent.violet
  const gradientBg = 'linear-gradient(135deg, #8854f3 0%, #F78F55 100%)';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate response - replace with your own API later
    setTimeout(() => {
      const assistantMsg: Message = {
        role: 'assistant',
        content: 'Это демо-ответ. Подключите ваше собственное API для реальных ответов.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1000);
  };


  return (
    <Box
      h="100%"
      bg={bgColor}
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
        onModelChange={setModel}
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
            <Box
              w="80px"
              h="80px"
              borderRadius="20px"
              bgGradient={gradientBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb="24px"
              boxShadow="0 10px 40px rgba(136, 84, 243, 0.4)"
              position="relative"
              _before={{
                content: '""',
                position: 'absolute',
                inset: '0',
                borderRadius: '20px',
                padding: '1px',
                bgGradient: gradientBg,
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'subtract',
              }}
            >
              <Icon as={MdAutoAwesome} w="40px" h="40px" color="white" />
            </Box>
            
            <div
              style={{
                fontSize: '2.25rem',
                marginBottom: '12px',
                backgroundImage: gradientBg,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              Привет, Andre
            </div>
            
            <Text
              fontSize="lg"
              color={textSecondary}
              mb="40px"
              maxW="600px"
            >
              Я ваш персональный AI ассистент. Задайте любой вопрос или выберите одну из категорий ниже
            </Text>
            </Flex>
          )}

          {/* Messages Area */}
          {messages.length > 0 && (
            <VStack
              spacing="16px"
              py="20px"
              w="100%"
            >
              {messages.map((message, index) => (
                <Flex
                  key={index}
                  w="100%"
                  justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Box
                    maxW="70%"
                    bg={message.role === 'user' ? accentColor : cardBg}
                    color={message.role === 'user' ? 'white' : textColor}
                    px="20px"
                    py="12px"
                    borderRadius="16px"
                    boxShadow={message.role === 'user' ? '0 4px 12px rgba(136, 84, 243, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.2)'}
                    border={message.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'}
                  >
                    {message.role === 'assistant' ? (
                      <MessageBoxChat output={message.content} />
                    ) : (
                      <Text>{message.content}</Text>
                    )}
                  </Box>
                </Flex>
              ))}
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
          bg={bgColor}
          borderTop="1px solid"
          borderColor={borderColor}
          px={{ base: '16px', md: '32px' }}
          py="12px"
          backdropFilter="blur(10px)"
          zIndex={10}
        >
          <Box
            maxW="1200px"
            mx="auto"
          >
            <NeuroniumChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder={messages.length === 0 ? 'Спроси любой вопрос' : 'Продолжить разговор...'}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}