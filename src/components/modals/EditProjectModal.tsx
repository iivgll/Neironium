"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  Input,
  VStack,
  Box,
  Text,
  Flex,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import { MdClose } from "react-icons/md";
import Image from "next/image";
import { COLORS } from "@/theme/colors";
import { validateProjectName, sanitizeString } from "@/utils/validation";
import { useAssetPath } from "@/hooks/useAssetPath";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject?: (projectName: string, description?: string) => void;
  currentName: string;
  currentDescription?: string;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  onUpdateProject,
  currentName,
  currentDescription = "",
}: EditProjectModalProps) {
  const [projectName, setProjectName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [validationError, setValidationError] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getAssetPath } = useAssetPath();

  console.log("EditProjectModal render:", {
    isOpen,
    currentName,
    currentDescription,
  });

  // Update local state when props change
  useEffect(() => {
    setProjectName(currentName);
    setDescription(currentDescription || "");
  }, [currentName, currentDescription]);

  // Автофокус при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      // Задержка для корректной анимации открытия модального окна
      const focusTimeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Для мобильных устройств - дополнительный клик для вызова клавиатуры
          if ("ontouchstart" in window) {
            inputRef.current.click();
          }
        }
      }, 100);

      return () => clearTimeout(focusTimeout);
    }
  }, [isOpen]);

  // Memoize validation to avoid duplicate calculations
  const validation = React.useMemo(
    () => validateProjectName(projectName),
    [projectName],
  );
  const isUpdateDisabled =
    !validation.isValid ||
    (projectName === currentName && description === currentDescription);

  const handleUpdate = () => {
    if (!validation.isValid) {
      setValidationError(validation.error || "Неверное название проекта");
      return;
    }

    try {
      const sanitizedName = sanitizeString(projectName.trim());
      const sanitizedDescription = description.trim() || undefined;
      onUpdateProject?.(sanitizedName, sanitizedDescription);
      setValidationError("");
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      setValidationError("Произошла ошибка при обновлении проекта");
    }
  };

  const handleClose = () => {
    console.log("EditProjectModal: handleClose called");
    setProjectName(currentName);
    setDescription(currentDescription || "");
    setValidationError("");
    setIsFocused(false);
    // Убираем фокус с поля при закрытии
    if (inputRef.current) {
      inputRef.current.blur();
    }
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      isCentered
      closeOnOverlayClick={true}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="blur(4px)"
        onClick={handleClose}
      />
      <ModalContent
        bg="#121314"
        border="none"
        borderRadius="55px"
        maxW={["90vw", "680px"]}
        mx="20px"
        p="0"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalBody p={["20px", "40px"]}>
          <VStack spacing={["30px", "40px"]} align="stretch" w="full">
            {/* Header */}
            <Flex align="center" justify="space-between">
              {/* Invisible placeholder for centering */}
              <Box w="36px" h="36px" opacity={0}>
                <IconButton
                  aria-label="placeholder"
                  icon={<MdClose />}
                  size="sm"
                  variant="ghost"
                />
              </Box>

              {/* Title */}
              <Text
                fontSize={["18px", "24px"]}
                fontWeight="700"
                color={COLORS.TEXT_PRIMARY}
                lineHeight={["18px", "24px"]}
                textAlign="center"
              >
                Редактировать проект
              </Text>

              {/* Close Button */}
              <IconButton
                aria-label="Close modal"
                icon={<MdClose size="16px" />}
                size="sm"
                variant="ghost"
                color={COLORS.TEXT_PRIMARY}
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                onClick={handleClose}
                borderRadius="100px"
                w="36px"
                h="36px"
              />
            </Flex>

            {/* Form Content */}
            <VStack spacing="20px" align="stretch">
              {/* Name Input Section */}
              <VStack spacing="6px" align="stretch">
                <Text
                  fontSize="12px"
                  color="rgba(247,248,250,0.5)"
                  letterSpacing="-0.4px"
                  lineHeight="12px"
                >
                  Название проекта
                </Text>
                <Box position="relative">
                  <Input
                    ref={inputRef}
                    value={projectName}
                    onChange={handleInputChange}
                    placeholder="Статья на Хабр"
                    isInvalid={!!validationError}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    bg="#1e1e1e"
                    border="1px solid white"
                    borderRadius="12px"
                    h="54px"
                    px="10px"
                    color="white"
                    fontSize="16px"
                    letterSpacing="-0.4px"
                    _placeholder={{ color: "#8c8c8c" }}
                    _hover={{ borderColor: "white" }}
                    _focus={{
                      borderColor: "white",
                      boxShadow: "none",
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isUpdateDisabled) {
                        handleUpdate();
                      }
                    }}
                  />
                </Box>
                {/* Validation Error Message */}
                {validationError && (
                  <Text fontSize="12px" color="#d05e5e" mt="4px">
                    {validationError}
                  </Text>
                )}
              </VStack>

              {/* Description Input Section */}
              <VStack spacing="6px" align="stretch">
                <Text
                  fontSize="12px"
                  color="rgba(247,248,250,0.5)"
                  letterSpacing="-0.4px"
                  lineHeight="12px"
                >
                  Описание (необязательно)
                </Text>
                <Textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Краткое описание проекта..."
                  bg="#1e1e1e"
                  border="1px solid #343434"
                  borderRadius="12px"
                  minH="80px"
                  maxH="120px"
                  px="10px"
                  py="10px"
                  color="white"
                  fontSize="16px"
                  letterSpacing="-0.4px"
                  resize="vertical"
                  _placeholder={{ color: "#8c8c8c" }}
                  _hover={{ borderColor: "#444444" }}
                  _focus={{
                    borderColor: "white",
                    boxShadow: "none",
                  }}
                />
              </VStack>

              {/* Info Section */}
              <Box bg="rgba(255,255,255,0.05)" borderRadius="20px" p="20px">
                <Flex align="flex-start" gap="10px">
                  <Image
                    src={getAssetPath("/icons/idea.svg")}
                    alt="Info"
                    width={24}
                    height={24}
                  />
                  <VStack spacing="8px" align="stretch" flex="1">
                    <Text
                      fontSize="16px"
                      fontWeight="700"
                      color={COLORS.TEXT_PRIMARY}
                      lineHeight="22px"
                    >
                      Что такое проект?
                    </Text>
                    <Text
                      fontSize="16px"
                      color="#8a8b8c"
                      lineHeight="22px"
                      letterSpacing="-0.4px"
                    >
                      В проектах чаты, файлы и пользовательские инструкции
                      хранятся в одном месте. Используйте их для текущей работы
                      или просто для поддержания порядка.
                    </Text>
                  </VStack>
                </Flex>
              </Box>
            </VStack>

            {/* Footer Buttons */}
            <Flex justify="flex-end" gap="16px" direction={["column", "row"]}>
              <Button
                bg="#343434"
                color={COLORS.TEXT_PRIMARY}
                borderRadius="100px"
                h="54px"
                px="20px"
                py="16px"
                fontWeight="700"
                fontSize="16px"
                _hover={{ bg: "rgba(52, 52, 52, 0.8)" }}
                _active={{ bg: "rgba(52, 52, 52, 0.6)" }}
                onClick={handleClose}
                order={[2, 1]}
              >
                Отменить
              </Button>
              <Button
                bg={isUpdateDisabled ? "rgba(255, 255, 255, 0.5)" : "white"}
                color="#1d1e20"
                borderRadius="100px"
                h="54px"
                px="20px"
                py="16px"
                fontWeight="700"
                fontSize="16px"
                isDisabled={isUpdateDisabled}
                _hover={
                  !isUpdateDisabled ? { bg: "rgba(255, 255, 255, 0.9)" } : {}
                }
                _active={
                  !isUpdateDisabled ? { bg: "rgba(255, 255, 255, 0.8)" } : {}
                }
                onClick={handleUpdate}
                order={[1, 2]}
              >
                Обновить проект
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
