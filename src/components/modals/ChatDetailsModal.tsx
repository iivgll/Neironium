"use client";
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Flex,
  IconButton,
  Icon,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdDriveFileMove, MdAdd, MdContentCopy } from "react-icons/md";
import { COLORS } from "@/theme/colors";
import { Chat } from "@/types/chat";

interface ChatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onCreateSubchat: () => void;
  onCopy: () => void;
  onChildChatClick: (chatId: number) => void;
}

export default function ChatDetailsModal({
  isOpen,
  onClose,
  chat,
  onRename,
  onMove,
  onDelete,
  onCreateSubchat,
  onCopy,
  onChildChatClick,
}: ChatDetailsModalProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  if (!chat) return null;

  const hasChildren = chat.children && chat.children.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "lg"} isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="#1a1a1a"
        border="1px solid #2a2a2a"
        borderRadius={isMobile ? "0" : "16px"}
        maxW={isMobile ? "100%" : "600px"}
        maxH={isMobile ? "100vh" : "85vh"}
        color={COLORS.TEXT_PRIMARY}
      >
        <ModalHeader
          fontSize="20px"
          fontWeight="600"
          borderBottom="1px solid #2a2a2a"
          pb="16px"
          pt="20px"
          px="24px"
        >
          <Flex align="center" gap="12px">
            <Box
              w="40px"
              h="40px"
              borderRadius="8px"
              bg="rgba(99, 102, 241, 0.1)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="20px">📁</Text>
            </Box>
            <VStack align="start" spacing="0">
              <Text fontSize="18px" fontWeight="600" color={COLORS.TEXT_PRIMARY}>
                {chat.title || "Без названия"}
              </Text>
              {chat.description && (
                <Text fontSize="13px" color={COLORS.TEXT_SECONDARY} fontWeight="400">
                  {chat.description}
                </Text>
              )}
            </VStack>
          </Flex>
        </ModalHeader>
        <ModalCloseButton color={COLORS.TEXT_SECONDARY} top="20px" right="20px" />

        <ModalBody py="20px" px="24px" overflowY="auto">
          <VStack spacing="20px" align="stretch">
            {/* Chat Information */}
            <Box>
              <Text fontSize="14px" fontWeight="600" color={COLORS.TEXT_PRIMARY} mb="12px">
                Информация о чате
              </Text>
              <VStack spacing="8px" align="stretch">
                <Flex justify="space-between">
                  <Text fontSize="13px" color={COLORS.TEXT_SECONDARY}>
                    ID чата
                  </Text>
                  <Text fontSize="13px" color={COLORS.TEXT_PRIMARY}>
                    {chat.id}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="13px" color={COLORS.TEXT_SECONDARY}>
                    Дата создания
                  </Text>
                  <Text fontSize="13px" color={COLORS.TEXT_PRIMARY}>
                    {chat.created_at
                      ? new Date(chat.created_at).toLocaleDateString("ru-RU")
                      : "—"}
                  </Text>
                </Flex>
                {chat.files_count !== undefined && (
                  <Flex justify="space-between">
                    <Text fontSize="13px" color={COLORS.TEXT_SECONDARY}>
                      Количество файлов
                    </Text>
                    <Text fontSize="13px" color={COLORS.TEXT_PRIMARY}>
                      {chat.files_count}
                    </Text>
                  </Flex>
                )}
                {chat.model && (
                  <Flex justify="space-between">
                    <Text fontSize="13px" color={COLORS.TEXT_SECONDARY}>
                      Модель
                    </Text>
                    <Text fontSize="13px" color={COLORS.TEXT_PRIMARY}>
                      {chat.model}
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>

            <Divider borderColor="#2a2a2a" />

            {/* Child Chats */}
            <Box>
              <Flex justify="space-between" align="center" mb="12px">
                <Text fontSize="14px" fontWeight="600" color={COLORS.TEXT_PRIMARY}>
                  Дочерние чаты ({chat.children?.length || 0})
                </Text>
                <IconButton
                  aria-label="Создать подчат"
                  icon={<Icon as={MdAdd} w="18px" h="18px" />}
                  size="sm"
                  variant="ghost"
                  color={COLORS.TEXT_PRIMARY}
                  bg="rgba(99, 102, 241, 0.1)"
                  _hover={{ bg: "rgba(99, 102, 241, 0.2)" }}
                  onClick={() => {
                    onCreateSubchat();
                    onClose();
                  }}
                />
              </Flex>

              {hasChildren ? (
                <VStack spacing="8px" align="stretch">
                  {chat.children!.map((childChat) => (
                    <Box
                      key={childChat.id}
                      px="12px"
                      py="10px"
                      borderRadius="8px"
                      bg="rgba(255, 255, 255, 0.03)"
                      border="1px solid rgba(255, 255, 255, 0.05)"
                      cursor="pointer"
                      _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => {
                        onChildChatClick(childChat.id);
                        onClose();
                      }}
                      transition="all 0.2s"
                    >
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing="2px" flex="1">
                          <Text fontSize="14px" color={COLORS.TEXT_PRIMARY} fontWeight="500">
                            {childChat.title || "Без названия"}
                          </Text>
                          {childChat.description && (
                            <Text fontSize="12px" color={COLORS.TEXT_SECONDARY} noOfLines={1}>
                              {childChat.description}
                            </Text>
                          )}
                        </VStack>
                        {childChat.children && childChat.children.length > 0 && (
                          <Text fontSize="12px" color={COLORS.TEXT_SECONDARY}>
                            {childChat.children.length} 📁
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Box
                  py="32px"
                  textAlign="center"
                  borderRadius="8px"
                  bg="rgba(255, 255, 255, 0.02)"
                  border="1px dashed rgba(255, 255, 255, 0.1)"
                >
                  <Text fontSize="13px" color={COLORS.TEXT_SECONDARY}>
                    Нет дочерних чатов
                  </Text>
                  <Text fontSize="12px" color={COLORS.TEXT_SECONDARY} mt="4px">
                    Создайте первый подчат нажав на +
                  </Text>
                </Box>
              )}
            </Box>

            <Divider borderColor="#2a2a2a" />

            {/* Actions */}
            <Box>
              <Text fontSize="14px" fontWeight="600" color={COLORS.TEXT_PRIMARY} mb="12px">
                Действия
              </Text>
              <VStack spacing="8px" align="stretch">
                <ActionButton
                  icon={MdEdit}
                  label="Переименовать чат"
                  onClick={() => {
                    onRename();
                    onClose();
                  }}
                />
                <ActionButton
                  icon={MdDriveFileMove}
                  label="Переместить в чат"
                  onClick={() => {
                    onMove();
                    onClose();
                  }}
                />
                <ActionButton
                  icon={MdContentCopy}
                  label="Копировать чат"
                  onClick={() => {
                    onCopy();
                    onClose();
                  }}
                />
                <ActionButton
                  icon={MdAdd}
                  label="Создать подчат"
                  onClick={() => {
                    onCreateSubchat();
                    onClose();
                  }}
                />
                <ActionButton
                  icon={MdDelete}
                  label="Удалить чат"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  isDestructive
                />
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
}

function ActionButton({ icon, label, onClick, isDestructive = false }: ActionButtonProps) {
  return (
    <Flex
      px="14px"
      py="12px"
      borderRadius="8px"
      bg="rgba(255, 255, 255, 0.03)"
      border="1px solid rgba(255, 255, 255, 0.05)"
      cursor="pointer"
      _hover={{ bg: isDestructive ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.05)" }}
      onClick={onClick}
      transition="all 0.2s"
      align="center"
      gap="12px"
    >
      <Icon
        as={icon}
        w="18px"
        h="18px"
        color={isDestructive ? "#ef4444" : COLORS.TEXT_SECONDARY}
      />
      <Text fontSize="14px" color={isDestructive ? "#ef4444" : COLORS.TEXT_PRIMARY}>
        {label}
      </Text>
    </Flex>
  );
}
