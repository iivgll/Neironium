"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Box,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { COLORS } from "@/theme/colors";
import { Chat } from "@/types/chat";

interface MoveToChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetChatId: number) => void;
  currentChatId: number;
  currentChatTitle: string;
  allChats: Chat[];
}

export default function MoveToChatModal({
  isOpen,
  onClose,
  onMove,
  currentChatId,
  currentChatTitle,
  allChats,
}: MoveToChatModalProps) {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Reset selected chat when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedChatId(null);
    }
  }, [isOpen]);

  // Flatten chat tree to list, excluding current chat and its children
  const flattenChats = (chats: Chat[], excludeIds: Set<number> = new Set()): Chat[] => {
    const result: Chat[] = [];

    const traverse = (chatList: Chat[]) => {
      for (const chat of chatList) {
        if (!excludeIds.has(chat.id)) {
          result.push(chat);
          if (chat.children && chat.children.length > 0) {
            traverse(chat.children);
          }
        }
      }
    };

    traverse(chats);
    return result;
  };

  // Get all descendant IDs to exclude them from selection
  const getDescendantIds = (chat: Chat): Set<number> => {
    const ids = new Set<number>([chat.id]);

    const traverse = (c: Chat) => {
      if (c.children) {
        for (const child of c.children) {
          ids.add(child.id);
          traverse(child);
        }
      }
    };

    traverse(chat);
    return ids;
  };

  // Find current chat in tree
  const findChat = (chats: Chat[], id: number): Chat | null => {
    for (const chat of chats) {
      if (chat.id === id) return chat;
      if (chat.children) {
        const found = findChat(chat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const currentChat = findChat(allChats, currentChatId);
  const excludeIds = currentChat ? getDescendantIds(currentChat) : new Set([currentChatId]);
  const availableChats = flattenChats(allChats, excludeIds);

  const handleMove = () => {
    if (selectedChatId !== null) {
      onMove(selectedChatId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "md"} isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="#121314"
        border="1px solid #343434"
        borderRadius={isMobile ? "0" : "20px"}
        maxW={isMobile ? "100%" : "500px"}
        maxH={isMobile ? "100vh" : "80vh"}
      >
        <ModalHeader
          fontSize={isMobile ? "20px" : "18px"}
          fontWeight="700"
          color={COLORS.TEXT_PRIMARY}
          borderBottom="1px solid #343434"
          pb="16px"
        >
          Переместить в чат
        </ModalHeader>

        <ModalBody py="20px" overflowY="auto">
          <Text fontSize="14px" color={COLORS.TEXT_SECONDARY} mb="16px">
            Выберите чат, в который хотите переместить &quot;{currentChatTitle}&quot;
          </Text>

          <VStack spacing="8px" align="stretch">
            {availableChats.length === 0 ? (
              <Text fontSize="14px" color={COLORS.TEXT_SECONDARY} textAlign="center" py="20px">
                Нет доступных чатов для перемещения
              </Text>
            ) : (
              availableChats.map((chat) => (
                <Box
                  key={chat.id}
                  px="16px"
                  py="12px"
                  borderRadius="10px"
                  bg={selectedChatId === chat.id ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.05)"}
                  border="1px solid"
                  borderColor={selectedChatId === chat.id ? "#6366f1" : "transparent"}
                  cursor="pointer"
                  _hover={{ bg: selectedChatId === chat.id ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.1)" }}
                  onClick={() => setSelectedChatId(chat.id)}
                  transition="all 0.2s"
                >
                  <Text
                    fontSize="14px"
                    color={COLORS.TEXT_PRIMARY}
                    fontWeight={selectedChatId === chat.id ? "600" : "400"}
                    noOfLines={1}
                  >
                    {chat.title || "Без названия"}
                  </Text>
                  {chat.description && (
                    <Text fontSize="12px" color={COLORS.TEXT_SECONDARY} noOfLines={1} mt="4px">
                      {chat.description}
                    </Text>
                  )}
                </Box>
              ))
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid #343434" pt="16px">
          <Flex w="100%" gap="12px" justify="flex-end">
            <Button
              variant="ghost"
              color={COLORS.TEXT_SECONDARY}
              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              onClick={onClose}
              fontSize="14px"
            >
              Отмена
            </Button>
            <Button
              bg="#6366f1"
              color="white"
              _hover={{ bg: "#5558e3" }}
              _active={{ bg: "#4a4dd1" }}
              onClick={handleMove}
              isDisabled={selectedChatId === null}
              fontSize="14px"
            >
              Переместить
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
