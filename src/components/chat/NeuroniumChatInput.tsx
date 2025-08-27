'use client';
import React, { useState, useRef, KeyboardEvent, ChangeEvent, useCallback, memo } from 'react';
import {
  Box,
  Flex,
  Textarea,
  Button,
} from '@chakra-ui/react';
import { useAutoResize } from '@/hooks/useAutoResize';
import InputActions from './InputActions';
import QuickActionsPanel from './QuickActionsPanel';
import { COLORS } from '@/theme/colors';

interface NeuroniumChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  variant?: 'default' | 'compact';
}

const NeuroniumChatInput = memo<NeuroniumChatInputProps>(({
  onSend,
  isLoading = false,
  placeholder = 'Спроси любой вопрос',
  variant = 'default',
}) => {
  const [message, setMessage] = useState('');
  const [showDeepSearch, setShowDeepSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use custom hook for auto-resize functionality
  const minHeight = variant === 'compact' ? 40 : 48;
  const maxHeight = variant === 'compact' ? 300 : 360;
  const { resetHeight } = useAutoResize(textareaRef, message, { minHeight, maxHeight });

  const handleSend = useCallback(() => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      resetHeight();
    }
  }, [message, isLoading, onSend, resetHeight]);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }, []);

  const handleQuickActionSelect = useCallback((prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  }, []);

  const handleToggleDeepSearch = useCallback(() => {
    setShowDeepSearch(prev => !prev);
  }, []);

  // Render compact version if specified
  if (variant === 'compact') {
    return (
      <Flex
        bg={COLORS.BG_SECONDARY}
        borderRadius="12px"
        border="1px solid"
        borderColor={COLORS.BORDER_SECONDARY}
        p="8px"
        align="flex-end"
        gap="8px"
      >
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          bg="transparent"
          border="none"
          color={COLORS.TEXT_PRIMARY}
          fontSize="16px"
          resize="none"
          minH={`${minHeight}px`}
          maxH={`${maxHeight}px`}
          flex="1"
          px="8px"
          py="6px"
          _placeholder={{ color: COLORS.TEXT_SECONDARY }}
          _focus={{ boxShadow: 'none' }}
          _disabled={{ opacity: 0.6 }}
        />
        
        {message.trim().length > 0 && (
          <Button
            aria-label="Send message"
            bg={COLORS.ACCENT_VIOLET}
            color="white"
            size="sm"
            onClick={handleSend}
            isDisabled={!message.trim() || isLoading}
            isLoading={isLoading}
            borderRadius="8px"
            _hover={{
              bg: COLORS.ACCENT_VIOLET_HOVER,
              transform: 'scale(1.05)',
            }}
            minW="60px"
          >
            Send
          </Button>
        )}
      </Flex>
    );
  }

  return (
    <Box w="100%">
      {/* Main Input Container */}
      <Box
        position="relative"
        borderRadius="12px"
        padding="1px"
        bg={COLORS.BORDER_SECONDARY}
        transition="all 0.2s"
        _focusWithin={{
          bg: COLORS.GRADIENT_PRIMARY,
        }}
      >
        <Box
          bg={COLORS.BG_SECONDARY}
          borderRadius="11px"
          overflow="hidden"
          position="relative"
        >
          {/* Textarea */}
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
              color={COLORS.TEXT_PRIMARY}
              fontSize="16px"
              fontWeight="400"
              lineHeight="24px"
              px="16px"
              py="12px"
              pr="16px"
              resize="none"
              minH={`${minHeight}px`}
              h={`${minHeight}px`}
              maxH={`${maxHeight}px`}
              overflowY="auto"
              transition="height 0.1s ease"
              _placeholder={{ 
                color: COLORS.TEXT_SECONDARY,
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
                  background: COLORS.TEXT_SECONDARY,
                  borderRadius: '2px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: COLORS.TEXT_PRIMARY,
                },
              }}
            />
          </Box>

          {/* Actions Row */}
          <InputActions
            showDeepSearch={showDeepSearch}
            onToggleDeepSearch={handleToggleDeepSearch}
            onSend={handleSend}
            hasMessage={message.trim().length > 0}
            isLoading={isLoading}
          />
        </Box>
      </Box>

      {/* Quick Actions Panel */}
      <QuickActionsPanel onActionSelect={handleQuickActionSelect} />
    </Box>
  );
});

NeuroniumChatInput.displayName = 'NeuroniumChatInput';

export default NeuroniumChatInput;

// For backward compatibility, export compact version as separate component
export const NeuroniumChatInputCompact = (props: NeuroniumChatInputProps) => (
  <NeuroniumChatInput {...props} variant="compact" />
);