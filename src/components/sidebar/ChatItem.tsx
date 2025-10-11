"use client";
import React from "react";
import { Flex, Text, Input, HStack, IconButton, Icon, Box } from "@chakra-ui/react";
import { MdMoreHoriz, MdKeyboardArrowRight, MdKeyboardArrowDown, MdAdd } from "react-icons/md";
import { Chat } from "@/types/chat";

interface ChatItemProps {
  chat: Chat;
  isProjectChat?: boolean;
  hoveredChatId: number | null;
  editingChatId: number | null;
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
  onPlusClick?: (e: React.MouseEvent) => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  level?: number;
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
    onPlusClick,
    hasChildren = false,
    isExpanded = false,
    onToggleExpand,
    level = 0,
  }) => {
    const isEditing = editingChatId === chat.id;
    const isHovered = hoveredChatId === chat.id;

    return (
      <Flex
        h={isProjectChat ? "36px" : "40px"}
        pl={`${10 + level * 16}px`} // Add indentation based on nesting level
        pr="10px"
        py={isProjectChat ? "6px" : "7px"}
        bg={chat.isActive ? theme.activeBg : "transparent"}
        align="center"
        cursor="pointer"
        _hover={{ bg: theme.hoverBg }}
        borderRadius={isProjectChat ? "8px" : "10px"}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        justify="space-between"
        position="relative"
        minW="250px" // Minimum width to prevent squishing on deep nesting
        w="100%"
      >
        {/* Expand/Collapse Arrow */}
        {hasChildren && (
          <IconButton
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
            icon={
              <Icon
                as={isExpanded ? MdKeyboardArrowDown : MdKeyboardArrowRight}
                w="20px"
                h="20px"
                color={theme.textSecondary}
              />
            }
            size="xs"
            variant="ghost"
            minW="20px"
            h="20px"
            mr="4px"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
          />
        )}

        {/* Spacer for items without children to align with items that have children */}
        {!hasChildren && <Box w="24px" mr="4px" />}

        {isEditing ? (
          <Input
            value={editingChatTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            onBlur={onEditingSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEditingSave();
              } else if (e.key === "Escape") {
                onEditingCancel();
              }
            }}
            fontSize={isProjectChat ? "14px" : "16px"}
            color={theme.textPrimary}
            bg="transparent"
            border="1px solid"
            borderColor={theme.textSecondary}
            borderRadius="4px"
            h={isProjectChat ? "24px" : "28px"}
            px="4px"
            flex="1"
            mr="8px"
            _focus={{
              borderColor: theme.textPrimary,
              boxShadow: "none",
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Text
            fontSize={isProjectChat ? "14px" : "16px"}
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
            aria-label={`Добавить подчат для ${chat.title}`}
            icon={
              <Icon
                as={MdAdd}
                w={isProjectChat ? "14px" : "16px"}
                h={isProjectChat ? "14px" : "16px"}
                color={theme.textSecondary}
              />
            }
            size="xs"
            variant="ghost"
            minW={isProjectChat ? "18px" : "20px"}
            h={isProjectChat ? "18px" : "20px"}
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            onClick={(e) => {
              e.stopPropagation();
              onPlusClick?.(e);
            }}
          />
          <IconButton
            aria-label={`Дополнительные действия для чата ${chat.title}`}
            icon={
              <Icon
                as={MdMoreHoriz}
                w={isProjectChat ? "14px" : "16px"}
                h={isProjectChat ? "14px" : "16px"}
                color={theme.textSecondary}
              />
            }
            size="xs"
            variant="ghost"
            minW={isProjectChat ? "18px" : "20px"}
            h={isProjectChat ? "18px" : "20px"}
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            onClick={onMoreActionsClick}
          />
        </HStack>
      </Flex>
    );
  },
);

ChatItem.displayName = "ChatItem";
