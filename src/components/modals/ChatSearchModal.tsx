"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  VStack,
  Box,
  Text,
  Flex,
  Divider,
} from "@chakra-ui/react";
// Removed unused imports - using SVG icons instead
import Image from "next/image";
import { COLORS } from "@/theme/colors";
import { ChatResult } from "@/types/chat";
import { useDebounce } from "@/hooks/useDebounce";
import { useChats } from "@/hooks/useChats";
import { useAssetPath } from "@/hooks/useAssetPath";

interface ChatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ChatResult interface moved to types/chat.ts

// Helper function to convert Chat to ChatResult
const convertChatToResult = (chat: any, source: string): ChatResult => ({
  id: chat.id,
  title: chat.title,
  lastMessage: "Последнее сообщение не загружено",
  date: "Сегодня",
  tags: [source],
});

export default function ChatSearchModal({
  isOpen,
  onClose,
}: ChatSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<ChatResult[]>([]);
  const { getAssetPath } = useAssetPath();

  // Get data from hooks
  const { chatsList, setActiveChat } = useChats();

  // Debounce search query by 300ms for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoize all available chat results
  const allChatResults = React.useMemo(() => {
    const results: ChatResult[] = [];

    // Add all chats
    chatsList.forEach((chat) => {
      results.push(convertChatToResult(chat, "Чаты"));
    });

    return results;
  }, [chatsList]);

  // Handle search with debounced value and error handling
  React.useEffect(() => {
    try {
      if (debouncedSearchQuery.trim() === "") {
        setFilteredResults(allChatResults);
      } else {
        const query = debouncedSearchQuery.toLowerCase().trim();
        const filtered = allChatResults.filter(
          (chat) =>
            chat.title.toLowerCase().includes(query) ||
            chat.lastMessage.toLowerCase().includes(query),
        );
        setFilteredResults(filtered);
      }
    } catch (error) {
      console.error("Error filtering chat results:", error);
      setFilteredResults([]);
    }
  }, [debouncedSearchQuery, allChatResults]);

  const handleChatSelect = (chatId: number) => {
    try {
      // Set active chat
      const regularChat = chatsList.find((chat) => chat.id === chatId);
      if (regularChat) {
        setActiveChat(chatId);
        onClose();
        return;
      }

      console.warn("Chat not found:", chatId);
      onClose();
    } catch (error) {
      console.error("Error selecting chat:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg={COLORS.BG_PRIMARY}
        border="1px solid"
        borderColor={COLORS.BORDER_PRIMARY}
        borderRadius="16px"
        maxW="600px"
        mx="20px"
      >
        <ModalHeader
          pb="16px"
          pt="24px"
          px="24px"
          borderBottom="1px solid"
          borderColor={COLORS.BORDER_SECONDARY}
          textAlign="center"
        >
          <Text fontSize="20px" fontWeight="600" color={COLORS.TEXT_PRIMARY}>
            Поиск в чатах
          </Text>
        </ModalHeader>

        <ModalCloseButton
          color={COLORS.TEXT_PRIMARY}
          _hover={{ bg: COLORS.BG_HOVER }}
          top="24px"
          right="24px"
        />

        <ModalBody p="24px" pt="20px">
          <VStack spacing="20px" align="stretch">
            {/* Search Input */}
            <InputGroup>
              <Input
                placeholder="Поиск по чатам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={COLORS.BG_SECONDARY}
                border="1px solid"
                borderColor={COLORS.BORDER_PRIMARY}
                borderRadius="12px"
                h="48px"
                pl="16px"
                pr="48px"
                color={COLORS.TEXT_PRIMARY}
                fontSize="16px"
                _placeholder={{ color: COLORS.TEXT_SECONDARY }}
                _hover={{ borderColor: COLORS.BORDER_SECONDARY }}
                _focus={{
                  borderColor: COLORS.ACCENT_VIOLET,
                  boxShadow: `0 0 0 1px ${COLORS.ACCENT_VIOLET}`,
                }}
              />
              <Box
                position="absolute"
                right="16px"
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
              >
                <Image
                  src={getAssetPath("/icons/magnifer.svg")}
                  alt="search"
                  width={20}
                  height={20}
                />
              </Box>
            </InputGroup>

            {/* Results Section */}
            <Box>
              {searchQuery && (
                <Text fontSize="14px" color={COLORS.TEXT_SECONDARY} mb="16px">
                  Найдено результатов: {filteredResults.length}
                </Text>
              )}

              <VStack spacing="0" align="stretch" maxH="400px" overflowY="auto">
                {filteredResults.map((chat, index) => (
                  <React.Fragment key={chat.id}>
                    <Flex
                      p="16px"
                      align="center"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: COLORS.BG_HOVER,
                      }}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <Image
                        src={getAssetPath("/icons/chat.svg")}
                        alt="chat"
                        width={20}
                        height={20}
                        style={{ marginRight: "12px" }}
                      />
                      <Text
                        fontSize="16px"
                        fontWeight="500"
                        color={COLORS.TEXT_PRIMARY}
                        noOfLines={1}
                        flex="1"
                      >
                        {chat.title}
                      </Text>
                    </Flex>
                    {index < filteredResults.length - 1 && (
                      <Divider borderColor={COLORS.BORDER_SECONDARY} />
                    )}
                  </React.Fragment>
                ))}

                {filteredResults.length === 0 && (
                  <Box py="40px" textAlign="center">
                    <Text
                      fontSize="16px"
                      color={COLORS.TEXT_SECONDARY}
                      mb="8px"
                    >
                      Ничего не найдено
                    </Text>
                    <Text fontSize="14px" color={COLORS.TEXT_TERTIARY}>
                      Попробуйте изменить запрос
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
