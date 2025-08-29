'use client';
import React from 'react';
import { Flex, Text, Input, HStack, IconButton, Icon } from '@chakra-ui/react';
import { MdMoreHoriz } from 'react-icons/md';
import { Chat } from '@/types/chat';

interface ChatItemProps {
  chat: Chat;
  isProjectChat?: boolean;
  hoveredChatId: string | null;
  editingChatId: string | null;
  editingChatTitle: string;
  theme: {
    activeBg: string;
    hoverBg: string;
    textPrimary: string;
    textSecondary: string;
  };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onDoubleClick: () => void;
  onEditingTitleChange: (title: string) => void;
  onEditingSave: () => void;
  onEditingCancel: () => void;
  onMoreActionsClick: (e: React.MouseEvent) => void;
  onAddToProjectClick?: (e: React.MouseEvent) => void;
}

export const ChatItem = React.memo<ChatItemProps>(
  ({
    chat,
    isProjectChat = false,
    hoveredChatId,
    editingChatId,
    editingChatTitle,
    theme,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onDoubleClick,
    onEditingTitleChange,
    onEditingSave,
    onEditingCancel,
    onMoreActionsClick,
    onAddToProjectClick,
  }) => {
    const isEditing = editingChatId === chat.id;
    const isHovered = hoveredChatId === chat.id;

    return (
      <Flex
        h={isProjectChat ? '36px' : '40px'}
        px="10px"
        py={isProjectChat ? '6px' : '7px'}
        bg={chat.isActive ? theme.activeBg : 'transparent'}
        align="center"
        cursor="pointer"
        _hover={{ bg: theme.hoverBg }}
        borderRadius={isProjectChat ? '8px' : '10px'}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        justify="space-between"
        position="relative"
      >
        {isEditing ? (
          <Input
            value={editingChatTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            onBlur={onEditingSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEditingSave();
              } else if (e.key === 'Escape') {
                onEditingCancel();
              }
            }}
            fontSize={isProjectChat ? '14px' : '16px'}
            color={theme.textPrimary}
            bg="transparent"
            border="1px solid"
            borderColor={theme.textSecondary}
            borderRadius="4px"
            h={isProjectChat ? '24px' : '28px'}
            px="4px"
            flex="1"
            mr="8px"
            _focus={{
              borderColor: theme.textPrimary,
              boxShadow: 'none',
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Text
            fontSize={isProjectChat ? '14px' : '16px'}
            color={theme.textPrimary}
            noOfLines={1}
            flex="1"
          >
            {chat.title}
          </Text>
        )}
        <HStack
          spacing="4px"
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.2s"
        >
          <IconButton
            aria-label={`Дополнительные действия для чата ${chat.title}`}
            icon={
              <Icon
                as={MdMoreHoriz}
                w={isProjectChat ? '14px' : '16px'}
                h={isProjectChat ? '14px' : '16px'}
                color={theme.textSecondary}
              />
            }
            size="xs"
            variant="ghost"
            minW={isProjectChat ? '18px' : '20px'}
            h={isProjectChat ? '18px' : '20px'}
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            onClick={onMoreActionsClick}
          />
          {!isProjectChat && onAddToProjectClick && (
            <IconButton
              aria-label={`Добавить чат ${chat.title} в проект`}
              icon={
                <Text fontSize="16px" color={theme.textSecondary}>
                  +
                </Text>
              }
              size="xs"
              variant="ghost"
              minW="20px"
              h="20px"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              onClick={onAddToProjectClick}
            />
          )}
        </HStack>
      </Flex>
    );
  },
);

ChatItem.displayName = 'ChatItem';
