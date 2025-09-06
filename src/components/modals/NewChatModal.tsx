"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useChatsContext } from "@/contexts/ChatsContext";
import { useProjects } from "@/contexts/ProjectsContext";

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
        project_id: selectedProject,
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
      setSelectedProject(selectedProjectId || null);
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
      setSelectedProject(selectedProjectId || null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent
        mx="4"
        borderRadius="12px"
        bg="#2a2a2a"
        border="1px solid #404040"
        color="white"
      >
        <ModalHeader>
          <Text fontSize="18px" fontWeight="600" color="white">
            Создать новый чат
          </Text>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody>
          <VStack spacing="16px" align="stretch">
            {/* Chat Title Input */}
            <FormControl isRequired>
              <FormLabel color="#a0a0a0" fontSize="14px" mb="8px">
                Название чата
              </FormLabel>
              <Input
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Введите название чата"
                bg="#1a1a1a"
                border="1px solid #404040"
                borderRadius="8px"
                color="white"
                fontSize="14px"
                _hover={{
                  borderColor: "#606060",
                }}
                _focus={{
                  borderColor: "#0066cc",
                  boxShadow: "0 0 0 1px #0066cc",
                }}
                _placeholder={{
                  color: "#666666",
                }}
                disabled={isLoading}
              />
            </FormControl>

            {/* Project Selection */}
            <FormControl>
              <FormLabel color="#a0a0a0" fontSize="14px" mb="8px">
                Проект (опционально)
              </FormLabel>
              <Select
                value={selectedProject || ""}
                onChange={(e) =>
                  setSelectedProject(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="Выберите проект или оставьте пустым"
                bg="#1a1a1a"
                border="1px solid #404040"
                borderRadius="8px"
                color="white"
                fontSize="14px"
                _hover={{
                  borderColor: "#606060",
                }}
                _focus={{
                  borderColor: "#0066cc",
                  boxShadow: "0 0 0 1px #0066cc",
                }}
                disabled={isLoading}
              >
                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                    style={{
                      backgroundColor: "#1a1a1a",
                      color: "white",
                    }}
                  >
                    {project.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Info text */}
            <Text fontSize="12px" color="#888888">
              После создания чат автоматически откроется и станет активным
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            disabled={isLoading}
            color="#a0a0a0"
            _hover={{ bg: "#3a3a3a" }}
          >
            Отмена
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Создание..."
            bg="#0066cc"
            _hover={{ bg: "#0052a3" }}
            _active={{ bg: "#004080" }}
          >
            Создать чат
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
