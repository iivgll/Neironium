"use client";
import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import { COLORS } from "@/theme/colors";
import { Project } from "@/types/chat";
import ProjectTooltip from "../tooltips/ProjectTooltip";
import { ArrowIcon } from "../icons/ArrowIcon";
import { useEffect } from "react";
import { useAssetPath } from "@/hooks/useAssetPath";

type MinimalProject = Pick<Project, "id" | "name">;

interface ChatActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onRename?: () => void;
  onAddToProject?: () => void;
  onCopy?: () => void;
  onNewProject?: () => void;
  onDeleteConfirm?: (chatTitle: string) => void;
  chatTitle?: string;
  chatId?: number;
  projects?: MinimalProject[];
  onMoveToProject?: (chatId: number, projectId: number) => void;
  onCreateProjectAndMove?: (chatId: number) => void;
}

// ProjectTooltip component moved to separate file

export default function ChatActionsModal({
  isOpen,
  onClose,
  position,
  onRename,
  onCopy,
  onNewProject,
  onDeleteConfirm,
  chatTitle = "Создание статей для Хабра",
  chatId,
  projects = [],
  onMoveToProject,
  onCreateProjectAndMove,
}: ChatActionsModalProps) {
  const [showProjectTooltip, setShowProjectTooltip] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { getAssetPath } = useAssetPath();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // Focus management for better accessibility
      if (event.key === "Tab") {
        // Let the browser handle tab navigation within the modal
        // The modal content is already focusable
        return;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNewProject = () => {
    setShowProjectTooltip(false);
    // В мобильной версии всегда открываем NewProjectModal
    // и, если есть chatId, устанавливаем его для перемещения в новый проект
    if (chatId && onCreateProjectAndMove) {
      onCreateProjectAndMove(chatId); // Уже содержит onClose()
    } else {
      onNewProject?.();
      onClose();
    }
  };

  // Close tooltip only when mouse leaves the entire tooltip area
  const handleTooltipAreaLeave = () => {
    setShowProjectTooltip(false);
  };

  if (isMobile) {
    // Mobile version - full screen modal
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
        <ModalContent
          bg="#121314"
          border="none"
          borderRadius="20px"
          maxW="90%"
          mx="20px"
          p="0"
          position="relative"
          zIndex={1600} // Higher z-index for mobile
        >
          <ModalBody p="20px" pb="30px">
            <VStack spacing="20px" align="stretch">
              {/* Header */}
              <Flex align="center" justify="space-between" mb="10px">
                <Box w="24px" h="24px" />
                <Text
                  fontSize="18px"
                  fontWeight="700"
                  color={COLORS.TEXT_PRIMARY}
                  textAlign="center"
                >
                  {chatTitle}
                </Text>
                <IconButton
                  aria-label="Close modal"
                  icon={<MdClose size="20px" />}
                  size="sm"
                  variant="ghost"
                  color={COLORS.TEXT_PRIMARY}
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  onClick={onClose}
                  borderRadius="100px"
                />
              </Flex>

              {/* Actions */}
              <VStack spacing="16px" align="stretch">
                {/* Rename */}
                <Flex
                  px="16px"
                  py="12px"
                  align="center"
                  cursor="pointer"
                  borderRadius="12px"
                  bg="rgba(255, 255, 255, 0.05)"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  _focus={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    outline: "2px solid white",
                  }}
                  onClick={() => {
                    onRename?.();
                    onClose();
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Переименовать чат ${chatTitle}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRename?.();
                      onClose();
                    }
                  }}
                >
                  <Image
                    src={getAssetPath("/icons/edit-2.svg")}
                    alt="Rename"
                    width={20}
                    height={20}
                  />
                  <Text
                    ml="12px"
                    fontSize="16px"
                    color={COLORS.TEXT_PRIMARY}
                    fontWeight="500"
                  >
                    Переименовать
                  </Text>
                </Flex>

                {/* Add to Project */}
                <Box>
                  <Flex
                    px="16px"
                    py="12px"
                    align="center"
                    cursor="pointer"
                    borderRadius="12px"
                    bg="rgba(255, 255, 255, 0.05)"
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                    _focus={{
                      bg: "rgba(255, 255, 255, 0.1)",
                      outline: "2px solid white",
                    }}
                    onClick={() => {
                      setShowProjectTooltip(!showProjectTooltip);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Добавить в проект"
                    aria-expanded={showProjectTooltip}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowProjectTooltip(!showProjectTooltip);
                      }
                    }}
                    justify="space-between"
                  >
                    <Flex align="center">
                      <Image
                        src={getAssetPath("/icons/folder.svg")}
                        alt="Add to project"
                        width={20}
                        height={20}
                      />
                      <Text
                        ml="12px"
                        fontSize="16px"
                        color={COLORS.TEXT_PRIMARY}
                        fontWeight="500"
                      >
                        Добавить в проект
                      </Text>
                    </Flex>
                    <ArrowIcon
                      transform={
                        showProjectTooltip ? "rotate(90deg)" : "rotate(270deg)"
                      }
                    />
                  </Flex>

                  {/* Project Selection - shown when expanded */}
                  {showProjectTooltip && (
                    <VStack
                      spacing="8px"
                      align="stretch"
                      mt="8px"
                      ml="16px"
                      mr="16px"
                    >
                      {/* New Project Option */}
                      <Flex
                        px="16px"
                        py="10px"
                        align="center"
                        cursor="pointer"
                        borderRadius="8px"
                        bg="rgba(255, 255, 255, 0.03)"
                        _hover={{ bg: "rgba(255, 255, 255, 0.08)" }}
                        onClick={handleNewProject}
                      >
                        <Image
                          src={getAssetPath("/icons/folder-add.svg")}
                          alt="New project"
                          width={16}
                          height={16}
                        />
                        <Text
                          ml="8px"
                          fontSize="14px"
                          color={COLORS.TEXT_PRIMARY}
                        >
                          Новый проект
                        </Text>
                      </Flex>

                      {projects.length > 0 && <Divider borderColor="#343434" />}

                      {/* Existing Projects */}
                      {projects.map((project) => (
                        <Flex
                          key={project.id}
                          px="16px"
                          py="10px"
                          align="center"
                          cursor="pointer"
                          borderRadius="8px"
                          bg="rgba(255, 255, 255, 0.03)"
                          _hover={{ bg: "rgba(255, 255, 255, 0.08)" }}
                          onClick={() => {
                            if (chatId && onMoveToProject) {
                              onMoveToProject(chatId, project.id);
                            }
                            onClose();
                          }}
                        >
                          <Image
                            src={getAssetPath("/icons/folder.svg")}
                            alt="Project"
                            width={16}
                            height={16}
                          />
                          <Text
                            ml="8px"
                            fontSize="14px"
                            color={COLORS.TEXT_PRIMARY}
                            noOfLines={1}
                          >
                            {project.name}
                          </Text>
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* Copy */}
                <Flex
                  px="16px"
                  py="12px"
                  align="center"
                  cursor="pointer"
                  borderRadius="12px"
                  bg="rgba(255, 255, 255, 0.05)"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  _focus={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    outline: "2px solid white",
                  }}
                  onClick={() => {
                    onCopy?.();
                    onClose();
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Копировать чат ${chatTitle}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onCopy?.();
                      onClose();
                    }
                  }}
                >
                  <Image
                    src={getAssetPath("/icons/copy.svg")}
                    alt="Copy"
                    width={20}
                    height={20}
                  />
                  <Text
                    ml="12px"
                    fontSize="16px"
                    color={COLORS.TEXT_PRIMARY}
                    fontWeight="500"
                  >
                    Копировать
                  </Text>
                </Flex>

                <Divider borderColor="#343434" />

                {/* Delete */}
                <Flex
                  px="16px"
                  py="12px"
                  align="center"
                  cursor="pointer"
                  borderRadius="12px"
                  bg="rgba(208, 94, 94, 0.1)"
                  _hover={{ bg: "rgba(208, 94, 94, 0.2)" }}
                  onClick={() => {
                    onDeleteConfirm?.(chatTitle);
                    onClose();
                  }}
                >
                  <Image
                    src={getAssetPath("/icons/trash.svg")}
                    alt="Delete"
                    width={20}
                    height={20}
                  />
                  <Text
                    ml="12px"
                    fontSize="16px"
                    color="#d05e5e"
                    fontWeight="500"
                  >
                    Удалить
                  </Text>
                </Flex>
              </VStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // Desktop version - positioned dropdown
  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        top="0"
        left="0"
        w="100vw"
        h="100vh"
        zIndex={1500} // Higher z-index to appear above sidebar
        onClick={onClose}
        pointerEvents="all"
      />

      {/* Main Actions Modal */}
      <Box
        position="fixed"
        left={`${position.x}px`}
        top={`${position.y}px`}
        zIndex={1501} // Higher z-index to appear above sidebar
      >
        <Box
          bg="#292929"
          borderRadius="10px"
          boxShadow="0px 0px 20px 0px rgba(0,0,0,0.4)"
          p="6px"
          w="160px"
        >
          <VStack spacing="0" align="stretch">
            {/* Rename */}
            <Flex
              px="10px"
              py="6px"
              align="center"
              cursor="pointer"
              borderRadius="5px"
              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              onClick={() => {
                onRename?.();
                onClose();
              }}
            >
              <Image
                src={getAssetPath("/icons/edit-2.svg")}
                alt="Rename"
                width={16}
                height={16}
              />
              <Text
                ml="5px"
                fontSize="12px"
                color={COLORS.TEXT_PRIMARY}
                letterSpacing="0.24px"
              >
                Переименовать
              </Text>
            </Flex>

            {/* Add to Project */}
            <Flex
              px="10px"
              py="6px"
              align="center"
              justify="space-between"
              cursor="pointer"
              borderRadius="5px"
              bg={showProjectTooltip ? "#434343" : "#343434"}
              _hover={{ bg: "#434343" }}
              onClick={() => {
                console.log(
                  "🖱️ Desktop: Добавить в проект clicked, showProjectTooltip:",
                  showProjectTooltip,
                );
                setShowProjectTooltip(!showProjectTooltip);
              }}
            >
              <Flex align="center">
                <Image
                  src={getAssetPath("/icons/folder.svg")}
                  alt="Add to project"
                  width={16}
                  height={16}
                />
                <Text
                  ml="5px"
                  fontSize="12px"
                  color={COLORS.TEXT_PRIMARY}
                  letterSpacing="0.24px"
                >
                  Добавить в проект
                </Text>
              </Flex>
              <ArrowIcon
                direction={showProjectTooltip ? "down" : "right"}
                color={COLORS.TEXT_SECONDARY}
                w="16px"
                h="16px"
              />
            </Flex>

            {/* Copy */}
            <Flex
              px="10px"
              py="6px"
              align="center"
              cursor="pointer"
              borderRadius="5px"
              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              onClick={() => {
                onCopy?.();
                onClose();
              }}
            >
              <Image
                src={getAssetPath("/icons/copy.svg")}
                alt="Copy"
                width={16}
                height={16}
              />
              <Text
                ml="5px"
                fontSize="12px"
                color={COLORS.TEXT_PRIMARY}
                letterSpacing="0.24px"
              >
                Копировать
              </Text>
            </Flex>

            <Divider borderColor="#343434" my="4px" />

            {/* Delete */}
            <Flex
              px="10px"
              py="6px"
              align="center"
              cursor="pointer"
              borderRadius="5px"
              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              onClick={() => {
                onDeleteConfirm?.(chatTitle);
                onClose();
              }}
            >
              <Image
                src={getAssetPath("/icons/trash.svg")}
                alt="Delete"
                width={16}
                height={16}
              />
              <Text
                ml="5px"
                fontSize="12px"
                color="#d05e5e"
                letterSpacing="0.24px"
              >
                Удалить
              </Text>
            </Flex>
          </VStack>
        </Box>
      </Box>

      {/* Project Tooltip */}
      <ProjectTooltip
        isOpen={showProjectTooltip}
        onClose={handleTooltipAreaLeave}
        position={position}
        onNewProject={handleNewProject}
        projects={projects}
        chatId={chatId}
        onMoveToProject={onMoveToProject}
        onCreateProjectAndMove={onCreateProjectAndMove}
      />
    </>
  );
}
