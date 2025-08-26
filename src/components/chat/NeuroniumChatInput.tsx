'use client';
import React, { useState, useRef, KeyboardEvent, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Flex,
  Textarea,
  IconButton,
  HStack,
  Button,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { MdAttachFile, MdMic, MdSend, MdSearch } from 'react-icons/md';
import { 
  FaStar, 
  FaBook, 
  FaLightbulb, 
  FaChartLine, 
  FaCogs, 
  FaHeart 
} from 'react-icons/fa';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface NeuroniumChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const quickActions: QuickAction[] = [
  { id: 'health', label: 'Здоровье', icon: FaStar, color: '#53D769' },
  { id: 'education', label: 'Образование', icon: FaBook, color: '#FF9500' },
  { id: 'productivity', label: 'Продуктивность', icon: FaLightbulb, color: '#007AFF' },
  { id: 'goals', label: 'Личные дела', icon: FaChartLine, color: '#AF52DE' },
  { id: 'development', label: 'Развлечение', icon: FaCogs, color: '#00C7BE' },
  { id: 'relationships', label: 'Отношения', icon: FaHeart, color: '#FF2D55' },
];

export default function NeuroniumChatInput({
  onSend,
  isLoading = false,
  placeholder = 'Спроси любой вопрос',
}: NeuroniumChatInputProps) {
  const [message, setMessage] = useState('');
  const [showDeepSearch, setShowDeepSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Colors for dark theme
  const bgColor = '#343434';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  const textColor = '#ffffff';
  const placeholderColor = '#8a8b8c';
  const iconColor = '#8a8b8c';
  const iconHoverColor = '#ffffff';
  const deepSearchActiveBg = '#8854f3';
  const actionBg = 'rgba(255, 255, 255, 0.05)';
  const gradientBg = 'linear-gradient(135deg, #8854f3 0%, #F78F55 100%)';

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      // If message is empty, reset to single line
      if (!message) {
        textareaRef.current.style.height = '48px';
        return;
      }
      
      // Reset to single line height first to calculate proper scrollHeight
      textareaRef.current.style.height = '48px';
      // Then calculate actual needed height
      const scrollHeight = textareaRef.current.scrollHeight;
      // Maximum height ~15 lines (increased 3x from 120px)
      const maxHeight = 360;
      // Only expand if content requires it
      if (scrollHeight > 48) {
        const newHeight = Math.min(scrollHeight, maxHeight);
        textareaRef.current.style.height = `${newHeight}px`;
      }
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleQuickAction = (action: QuickAction) => {
    const prompts = {
      health: 'Расскажи про здоровый образ жизни',
      education: 'Помоги мне с обучением',
      productivity: 'Как повысить продуктивность?',
      goals: 'Помоги поставить личные цели',
      development: 'Предложи идеи для развлечения',
      relationships: 'Дай советы по отношениям',
    };
    
    const prompt = prompts[action.id as keyof typeof prompts];
    if (prompt) {
      setMessage(prompt);
      textareaRef.current?.focus();
    }
  };

  return (
    <Box w="100%">
      {/* Main Input Container */}
      <Box
        position="relative"
        borderRadius="12px"
        padding="1px"
        bg={borderColor}
        transition="all 0.2s"
        _focusWithin={{
          bg: gradientBg,
        }}
      >
        <Box
          bg={bgColor}
          borderRadius="11px"
          overflow="hidden"
          position="relative"
        >
        {/* First Row - Textarea */}
        <Box position="relative" w="100%">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            bg="transparent"
            border="none"
            borderRadius="0"
            color={textColor}
            fontSize="16px"
            fontWeight="400"
            lineHeight="24px"
            px="16px"
            py="12px"
            pr="16px"
            resize="none"
            minH="48px"
            h="48px"
            maxH="360px"
            overflowY="auto"
            transition="height 0.1s ease"
            _placeholder={{ 
              color: placeholderColor,
              fontSize: '16px',
              fontWeight: '400',
            }}
            _focus={{ 
              boxShadow: 'none',
              outline: 'none',
            }}
            _disabled={{
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: iconColor,
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: iconHoverColor,
              },
            }}
          />
        </Box>

        {/* Second Row - Actions */}
        <Flex
          borderTop="1px solid"
          borderColor={borderColor}
          px="12px"
          py="8px"
          align="center"
          justify="space-between"
          bg="rgba(255, 255, 255, 0.02)"
        >
          {/* Left Side Actions */}
          <HStack spacing="8px">
            {/* Attach File Button */}
            <Tooltip label="Прикрепить файл" placement="top" hasArrow>
              <IconButton
                aria-label="Attach file"
                icon={<MdAttachFile size={20} />}
                variant="ghost"
                size="sm"
                color={iconColor}
                _hover={{ 
                  bg: actionBg,
                  color: iconHoverColor,
                }}
                _active={{
                  bg: 'rgba(255, 255, 255, 0.1)',
                }}
                borderRadius="8px"
                minW="32px"
                h="32px"
                transition="all 0.2s"
              />
            </Tooltip>

            {/* Deep Research Button */}
            <Tooltip 
              label={showDeepSearch ? "Deep Research активен" : "Включить Deep Research"} 
              placement="top" 
              hasArrow
            >
              <Button
                size="sm"
                variant={showDeepSearch ? "solid" : "ghost"}
                bg={showDeepSearch ? deepSearchActiveBg : "transparent"}
                color={showDeepSearch ? "white" : iconColor}
                leftIcon={<MdSearch size={16} />}
                onClick={() => setShowDeepSearch(!showDeepSearch)}
                fontSize="14px"
                fontWeight="500"
                h="32px"
                px="12px"
                borderRadius="8px"
                _hover={{
                  bg: showDeepSearch ? deepSearchActiveBg : actionBg,
                  color: showDeepSearch ? "white" : iconHoverColor,
                }}
                _active={{
                  bg: showDeepSearch ? '#7B3FF2' : 'rgba(255, 255, 255, 0.1)',
                }}
                transition="all 0.2s"
              >
                Deep Research
              </Button>
            </Tooltip>
          </HStack>

          {/* Right Side Actions */}
          <HStack spacing="8px">
            {/* Voice Input Button */}
            <Tooltip label="Голосовой ввод" placement="top" hasArrow>
              <IconButton
                aria-label="Voice input"
                icon={<MdMic size={20} />}
                variant="ghost"
                size="sm"
                color={iconColor}
                _hover={{ 
                  bg: actionBg,
                  color: iconHoverColor,
                }}
                _active={{
                  bg: 'rgba(255, 255, 255, 0.1)',
                }}
                borderRadius="8px"
                minW="32px"
                h="32px"
                transition="all 0.2s"
              />
            </Tooltip>

            {/* Send Button - Only visible when there's text */}
            {message.trim().length > 0 && (
              <Tooltip label="Отправить" placement="top" hasArrow>
                <IconButton
                  aria-label="Send message"
                  icon={<MdSend size={20} />}
                  variant="solid"
                  size="sm"
                  bg="#8854f3"
                  color="white"
                  onClick={handleSend}
                  isDisabled={!message.trim() || isLoading}
                  isLoading={isLoading}
                  _hover={{
                    bg: '#7B3FF2',
                    transform: 'scale(1.05)',
                  }}
                  _active={{
                    bg: '#6525D3',
                    transform: 'scale(0.98)',
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    transform: 'scale(1)',
                  }}
                  borderRadius="8px"
                  minW="32px"
                  h="32px"
                  transition="all 0.2s"
                />
              </Tooltip>
            )}
          </HStack>
        </Flex>
        </Box>
      </Box>

      {/* Quick Actions Panel */}
      <Flex
        flexWrap="wrap"
        gap="6px"
        mt="12px"
        justify="center"
        align="center"
      >
        {quickActions.map((action) => (
          <Button
            key={action.id}
            size="xs"
            variant="ghost"
            leftIcon={<Icon as={action.icon} color={action.color} boxSize="14px" />}
            onClick={() => handleQuickAction(action)}
            px="12px"
            py="4px"
            h="28px"
            bg={actionBg}
            borderRadius="100px"
            color={textColor}
            _hover={{
              bg: action.color,
              color: 'white',
              '& svg': {
                color: 'white',
              },
            }}
            _active={{
              transform: 'scale(0.98)',
            }}
            whiteSpace="nowrap"
            fontSize="13px"
            fontWeight="500"
            transition="all 0.2s"
          >
            {action.label}
          </Button>
        ))}
      </Flex>
    </Box>
  );
}

// Compact Version for smaller screens
export function NeuroniumChatInputCompact({
  onSend,
  isLoading = false,
  placeholder = 'Спроси любой вопрос',
}: NeuroniumChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const bgColor = '#343434';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  const textColor = '#ffffff';
  const placeholderColor = '#8a8b8c';

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      // If message is empty, reset to single line
      if (!message) {
        textareaRef.current.style.height = '40px';
        return;
      }
      
      // Reset to single line height first to calculate proper scrollHeight
      textareaRef.current.style.height = '40px';
      // Then calculate actual needed height
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 300; // Increased 3x from 100px
      // Only expand if content requires it
      if (scrollHeight > 40) {
        const newHeight = Math.min(scrollHeight, maxHeight);
        textareaRef.current.style.height = `${newHeight}px`;
      }
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Flex
      bg={bgColor}
      borderRadius="12px"
      border="1px solid"
      borderColor={borderColor}
      p="8px"
      align="flex-end"
      gap="8px"
    >
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        disabled={isLoading}
        bg="transparent"
        border="none"
        color={textColor}
        fontSize="16px"
        resize="none"
        minH="40px"
        maxH="300px"
        flex="1"
        px="8px"
        py="6px"
        _placeholder={{ color: placeholderColor }}
        _focus={{ boxShadow: 'none' }}
        _disabled={{ opacity: 0.6 }}
      />
      
      {message.trim().length > 0 && (
        <IconButton
          aria-label="Send message"
          icon={<MdSend />}
          bg="#8854f3"
          color="white"
          size="sm"
          onClick={handleSend}
          isDisabled={!message.trim() || isLoading}
          isLoading={isLoading}
          borderRadius="8px"
          _hover={{
            bg: '#7B3FF2',
            transform: 'scale(1.05)',
          }}
        />
      )}
    </Flex>
  );
}