"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  Text,
  VStack,
  useToast,
  Flex,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { MdClose } from "react-icons/md";
import { useChatsContext } from "@/contexts/ChatsContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { COLORS } from "@/theme/colors";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectId?: number | null; // Pre-select a project if opened from project context
}

export default function NewChatModal({
  isOpen,
  onClose,
  selectedProjectId,
}: NewChatModalProps) {
  const [chatTitle, setChatTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(
    selectedProjectId || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { createChat, setActiveChat } = useChatsContext();
  const { projects } = useProjects();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!chatTitle.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название чата",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create new chat via API
      const newChat = await createChat({
        title: chatTitle.trim(),
        project_id: projects.length > 0 ? selectedProject : null,
        // You can add more fields here like model, temperature, system_prompt
        // model: 'gpt-4',
        // temperature: 0.7,
      });

      // Automatically set the new chat as active and navigate to it
      setActiveChat(newChat.id);

      toast({
        title: "Успешно",
        description: "Чат создан",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setChatTitle("");
      setSelectedProject(
        projects.length > 0 ? selectedProjectId || null : null,
      );
      onClose();
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast({
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Не удалось создать чат",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setChatTitle("");
      setSelectedProject(
        projects.length > 0 ? selectedProjectId || null : null,
      );
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="#121314"
        border="none"
        borderRadius="55px"
        maxW={["90vw", "680px"]}
        mx="20px"
        p="0"
      >
        <ModalBody p="40px">
          <VStack spacing="40px" align="stretch" w="full">
            {/* Header with Title and Close */}
            <Flex align="center" justify="center" position="relative">
              <Text
                fontSize="24px"
                fontWeight="700"
                color={COLORS.TEXT_PRIMARY}
                textAlign="center"
              >
                Новый чат
              </Text>
              <IconButton
                aria-label="Close modal"
                icon={<MdClose size="20px" />}
                position="absolute"
                right="0"
                size="sm"
                variant="ghost"
                color={COLORS.TEXT_PRIMARY}
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                onClick={handleClose}
                borderRadius="full"
              />
            </Flex>

            {/* Form Fields */}
            <VStack spacing="24px" align="stretch">
              {/* Chat Title Input */}
              <VStack spacing="8px" align="stretch">
                <Text
                  fontSize="14px"
                  color="rgba(255,255,255,0.6)"
                  fontWeight="500"
                >
                  Название чата
                </Text>
                <Input
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  placeholder="Привет"
                  bg="transparent"
                  border="1px solid rgba(255,255,255,0.2)"
                  borderRadius="8px"
                  h="48px"
                  px="16px"
                  color="white"
                  fontSize="16px"
                  w="100%"
                  _placeholder={{ color: "rgba(255,255,255,0.4)" }}
                  _hover={{ borderColor: "rgba(255,255,255,0.3)" }}
                  _focus={{
                    borderColor: "rgba(255,255,255,0.5)",
                    boxShadow: "none",
                  }}
                  disabled={isLoading}
                />
              </VStack>

              {/* Project Selection */}
              {projects.length > 0 ? (
                <VStack spacing="8px" align="stretch">
                  <Text
                    fontSize="14px"
                    color="rgba(255,255,255,0.6)"
                    fontWeight="500"
                  >
                    Проект (опционально)
                  </Text>
                  <Select
                    value={selectedProject || ""}
                    onChange={(e) =>
                      setSelectedProject(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="Без проекта"
                    bg="transparent"
                    border="1px solid rgba(255,255,255,0.2)"
                    borderRadius="8px"
                    h="48px"
                    pl="16px"
                    pr="40px"
                    color="white"
                    fontSize="16px"
                    w="100%"
                    _placeholder={{ color: "rgba(255,255,255,0.4)" }}
                    _hover={{ borderColor: "rgba(255,255,255,0.3)" }}
                    _focus={{
                      borderColor: "rgba(255,255,255,0.5)",
                      boxShadow: "none",
                    }}
                    disabled={isLoading}
                    css={{
                      "& > option": {
                        backgroundColor: "#121314",
                        color: "white",
                      },
                    }}
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </VStack>
              ) : (
                <VStack spacing="8px" align="stretch">
                  <Text
                    fontSize="14px"
                    color="rgba(255,255,255,0.6)"
                    fontWeight="500"
                  >
                    Проект
                  </Text>
                  <Box
                    bg="transparent"
                    border="1px solid rgba(255,255,255,0.2)"
                    borderRadius="8px"
                    h="48px"
                    px="16px"
                    color="rgba(255,255,255,0.4)"
                    fontSize="16px"
                    w="100%"
                    display="flex"
                    alignItems="center"
                  >
                    Без проекта
                  </Box>
                </VStack>
              )}
            </VStack>

            {/* Info text - minimal */}
            <Text
              fontSize="14px"
              color="rgba(255,255,255,0.4)"
              textAlign="center"
              lineHeight="1.5"
            >
              После создания чат автоматически откроется и станет активным
            </Text>

            {/* Buttons */}
            <Flex gap="12px" justify="center">
              <Button
                bg="rgba(255,255,255,0.1)"
                color={COLORS.TEXT_PRIMARY}
                borderRadius="full"
                h="48px"
                px="32px"
                fontWeight="600"
                fontSize="16px"
                _hover={{ bg: "rgba(255,255,255,0.15)" }}
                _active={{ bg: "rgba(255,255,255,0.2)" }}
                onClick={handleClose}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                bg={
                  !chatTitle.trim() || isLoading
                    ? "rgba(255,255,255,0.3)"
                    : "white"
                }
                color="#000"
                borderRadius="full"
                h="48px"
                px="32px"
                fontWeight="600"
                fontSize="16px"
                isDisabled={!chatTitle.trim() || isLoading}
                isLoading={isLoading}
                loadingText="Создание..."
                _hover={
                  chatTitle.trim() && !isLoading
                    ? { bg: "rgba(255,255,255,0.9)" }
                    : {}
                }
                _active={
                  chatTitle.trim() && !isLoading
                    ? { bg: "rgba(255,255,255,0.8)" }
                    : {}
                }
                onClick={handleSubmit}
              >
                Создать чат
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
