"use client";
import React, { useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { MdLink, MdInsertDriveFile, MdFolder } from "react-icons/md";
import { COLORS } from "@/theme/colors";
import { Chat } from "@/types/chat";

interface ChatTreeViewProps {
  rootChat: Chat;
  onChatClick: (chatId: number) => void;
  onRenameChat: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
  onCreateSubchat: (parentChatId: number) => void;
  activeChatId?: number | null;
}

// Helper to flatten chat tree into a list
const flattenChats = (chat: Chat): Chat[] => {
  const result: Chat[] = [chat];

  if (chat.children && chat.children.length > 0) {
    chat.children.forEach((child) => {
      result.push(...flattenChats(child));
    });
  }

  return result;
};

// Helper to count total files
const countTotalFiles = (chats: Chat[]): number => {
  return chats.reduce((sum, chat) => sum + (chat.files?.length || 0), 0);
};

export default function ChatTreeView({
  rootChat,
  onChatClick,
}: ChatTreeViewProps) {
  // Flatten all chats in the tree
  const allChatsIncludingRoot = useMemo(() => flattenChats(rootChat), [rootChat]);

  // Chats to display (exclude root)
  const allChats = useMemo(() => {
    return allChatsIncludingRoot.filter(chat => chat.id !== rootChat.id);
  }, [allChatsIncludingRoot, rootChat.id]);

  // Count files from ALL chats including root
  const totalFiles = useMemo(() => countTotalFiles(allChatsIncludingRoot), [allChatsIncludingRoot]);

  // Get unique file icons for preview (max 3)
  const fileIconsPreview = useMemo(() => {
    const icons: JSX.Element[] = [];
    const seenTypes = new Set<string>();

    for (const chat of allChatsIncludingRoot) {
      if (!chat.files) continue;
      for (const file of chat.files) {
        const isLink = file.name.startsWith("http");
        const type = isLink ? "link" : "doc";

        if (!seenTypes.has(type) && icons.length < 3) {
          seenTypes.add(type);
          icons.push(
            <Box
              key={type}
              w="20px"
              h="20px"
              borderRadius="4px"
              bg={isLink ? "#0ea5e9" : "#ef4444"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                as={isLink ? MdLink : MdInsertDriveFile}
                w="12px"
                h="12px"
                color="white"
              />
            </Box>
          );
        }
        if (icons.length >= 3) break;
      }
      if (icons.length >= 3) break;
    }

    return icons;
  }, [allChatsIncludingRoot]);

  return (
    <Flex
      h="100%"
      direction="column"
      px={{ base: "16px", md: "24px" }}
      py="20px"
      overflow="hidden"
    >
      <VStack spacing="0" align="stretch" w="100%" h="100%">
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          pb="20px"
          borderBottom="1px solid"
          borderColor="rgba(255, 255, 255, 0.05)"
          flexShrink={0}
        >
          <HStack spacing="12px">
            <Icon as={MdFolder} w="24px" h="24px" color={COLORS.TEXT_PRIMARY} />
            <Text fontSize="18px" fontWeight="600" color={COLORS.TEXT_PRIMARY}>
              {rootChat.title || "Без названия"}
            </Text>
          </HStack>

          {/* Files count with preview icons */}
          <HStack spacing="8px">
            <Text fontSize="14px" color={COLORS.TEXT_SECONDARY}>
              {totalFiles} {totalFiles === 0 ? "файлов" : totalFiles === 1 ? "файл" : totalFiles < 5 ? "файла" : "файлов"}
            </Text>
            <HStack spacing="-4px">
              {fileIconsPreview}
            </HStack>
          </HStack>
        </Flex>

        {/* Chats list */}
        <VStack
          spacing="0"
          align="stretch"
          pt="4px"
          pb="80px"
          flex="1"
          overflowY="auto"
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          {allChats.length > 0 ? (
            allChats.map((chat, index) => (
              <Box key={chat.id}>
                <VStack
                  spacing="12px"
                  align="stretch"
                  py="20px"
                  cursor="pointer"
                  onClick={() => onChatClick(chat.id)}
                  _hover={{
                    "& .chat-title": { color: COLORS.TEXT_PRIMARY },
                  }}
                  transition="all 0.2s"
                >
                  {/* Chat title */}
                  <Text
                    className="chat-title"
                    fontSize="16px"
                    fontWeight="500"
                    color={COLORS.TEXT_SECONDARY}
                    transition="color 0.2s"
                  >
                    {chat.title || "Название"}
                  </Text>

                  {/* Files */}
                  {chat.files && chat.files.length > 0 && (
                    <Flex gap="8px" flexWrap="wrap">
                      {chat.files.map((file) => {
                        const isLink = file.name.startsWith("http");

                        // Extract file name and extension
                        const getFileNameAndExtension = (fileName: string) => {
                          if (isLink) return { name: fileName, extension: "" };

                          const lastDotIndex = fileName.lastIndexOf(".");
                          if (lastDotIndex === -1 || lastDotIndex === 0) {
                            return { name: fileName, extension: "" };
                          }

                          return {
                            name: fileName.substring(0, lastDotIndex),
                            extension: fileName.substring(lastDotIndex), // includes the dot
                          };
                        };

                        const { name, extension } = getFileNameAndExtension(file.name);

                        return (
                          <Flex
                            key={file.id}
                            align="center"
                            gap="8px"
                            px="12px"
                            py="8px"
                            borderRadius="100px"
                            bg="rgba(255, 255, 255, 0.05)"
                            border="1px solid rgba(255, 255, 255, 0.08)"
                            _hover={{
                              bg: "rgba(255, 255, 255, 0.08)",
                              borderColor: "rgba(255, 255, 255, 0.12)",
                            }}
                            transition="all 0.2s"
                            maxW="200px"
                            minW="fit-content"
                          >
                            <Icon
                              as={isLink ? MdLink : MdInsertDriveFile}
                              w="16px"
                              h="16px"
                              color={COLORS.TEXT_SECONDARY}
                              flexShrink={0}
                            />
                            <Flex align="center" gap="0" minW="0" flex="1">
                              <Text
                                fontSize="14px"
                                color={COLORS.TEXT_SECONDARY}
                                opacity={0.7}
                                noOfLines={1}
                                overflow="hidden"
                                textOverflow="ellipsis"
                                flex="1"
                                minW="0"
                              >
                                {name}
                              </Text>
                              {extension && (
                                <Text
                                  fontSize="14px"
                                  color={COLORS.TEXT_SECONDARY}
                                  fontWeight="600"
                                  opacity={1}
                                  flexShrink={0}
                                  ml="2px"
                                >
                                  {extension}
                                </Text>
                              )}
                            </Flex>
                          </Flex>
                        );
                      })}
                    </Flex>
                  )}
                </VStack>

                {/* Divider */}
                {index < allChats.length - 1 && (
                  <Box h="1px" bg="rgba(255, 255, 255, 0.05)" />
                )}
              </Box>
            ))
          ) : (
            <Flex
              h="200px"
              align="center"
              justify="center"
              direction="column"
              gap="12px"
            >
              <Icon as={MdFolder} w="48px" h="48px" color={COLORS.TEXT_SECONDARY} opacity={0.3} />
              <Text fontSize="14px" color={COLORS.TEXT_SECONDARY}>
                Нет дочерних чатов
              </Text>
            </Flex>
          )}
        </VStack>
      </VStack>
    </Flex>
  );
}
