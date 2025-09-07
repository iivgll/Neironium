"use client";
import React, { useMemo } from "react";
import { Box, Flex, Text, VStack, Divider } from "@chakra-ui/react";
import Image from "next/image";
import { COLORS } from "@/theme/colors";
import { Project } from "@/types/chat";
import { useAssetPath } from "@/hooks/useAssetPath";

type MinimalProject = Pick<Project, "id" | "name">;

interface ProjectTooltipProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onNewProject?: () => void;
  projects?: MinimalProject[];
  chatId?: number;
  onMoveToProject?: (chatId: number, projectId: number) => void;
  onCreateProjectAndMove?: (chatId: number) => void;
}

export default function ProjectTooltip({
  isOpen,
  onClose,
  position,
  onNewProject,
  projects = [],
  chatId,
  onMoveToProject,
  onCreateProjectAndMove,
}: ProjectTooltipProps) {
  const { getAssetPath } = useAssetPath();

  // Memoize project items for performance
  const projectItems = useMemo(
    () =>
      projects.map((project) => (
        <Flex
          key={project.id}
          px="10px"
          py="6px"
          align="center"
          cursor="pointer"
          borderRadius="5px"
          _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
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
            ml="5px"
            fontSize="12px"
            color={COLORS.TEXT_PRIMARY}
            letterSpacing="0.24px"
          >
            {project.name}
          </Text>
        </Flex>
      )),
    [projects, chatId, onMoveToProject, getAssetPath, onClose],
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible bridge between main modal and tooltip */}
      <Box
        position="fixed"
        left={`${position.x + 150}px`} // Bridge area between modals
        top={`${position.y}px`}
        w="20px" // Small bridge width
        h="40px" // Same height as the menu item
        zIndex={1502} // Higher than ChatActionsModal backdrop (1501)
        pointerEvents="all"
        onMouseLeave={onClose}
      />
      <Box
        position="fixed"
        left={`${position.x + 160}px`} // Position to the right of the main modal
        top={`${position.y}px`}
        zIndex={1502} // Higher than ChatActionsModal backdrop (1501)
        onMouseLeave={onClose}
        pointerEvents="all" // Ensure this element can receive pointer events
      >
        <Box
          bg="#292929"
          borderRadius="10px"
          boxShadow="0px 0px 20px 0px rgba(0,0,0,0.4)"
          p="6px"
          w="140px"
          position="relative"
          zIndex={1503} // Even higher to ensure content is clickable
          pointerEvents="all"
        >
          <VStack spacing="0" align="stretch">
            {/* New Project Option */}
            <Flex
              px="10px"
              py="6px"
              align="center"
              cursor="pointer"
              borderRadius="5px"
              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              onClick={(e) => {
                console.log("🖱️ Desktop ProjectTooltip: Новый проект clicked!");
                e.stopPropagation();
                if (chatId && onCreateProjectAndMove) {
                  console.log(
                    "🖱️ Using onCreateProjectAndMove with chatId:",
                    chatId,
                  );
                  onCreateProjectAndMove(chatId);
                } else {
                  console.log("🖱️ Using onNewProject");
                  onNewProject?.();
                }
                onClose();
              }}
            >
              <Image
                src={getAssetPath("/icons/folder-add.svg")}
                alt="New project"
                width={16}
                height={16}
              />
              <Text
                ml="5px"
                fontSize="12px"
                color={COLORS.TEXT_PRIMARY}
                letterSpacing="0.24px"
              >
                Новый проект
              </Text>
            </Flex>

            <Divider borderColor="#343434" my="4px" />

            {/* Existing Projects - memoized for performance */}
            {projectItems}
          </VStack>
        </Box>
      </Box>
    </>
  );
}
