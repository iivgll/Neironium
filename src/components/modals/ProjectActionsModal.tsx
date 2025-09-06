"use client";
import React from "react";
import { Box, Text, VStack, useDisclosure } from "@chakra-ui/react";
import Image from "next/image";
import { useAssetPath } from "@/hooks/useAssetPath";
import DeleteProjectConfirmModal from "./DeleteProjectConfirmModal";

interface ProjectActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  projectName: string;
  projectId: number;
  onEdit: () => void;
  onDeleteConfirm: (projectName: string) => void;
}

export default function ProjectActionsModal({
  isOpen,
  onClose,
  position,
  projectName,
  projectId,
  onEdit,
  onDeleteConfirm,
}: ProjectActionsModalProps) {
  const { getAssetPath } = useAssetPath();

  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose,
  } = useDisclosure();

  if (!isOpen) return null;

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleDeleteClick = () => {
    onDeleteConfirmOpen();
    onClose();
  };

  const handleDeleteConfirm = () => {
    onDeleteConfirm(projectName);
    onDeleteConfirmClose();
  };

  return (
    <>
      <Box
        position="fixed"
        left={`${position.x}px`}
        top={`${position.y}px`}
        bg="#121314"
        borderRadius="20px"
        border="1px solid #343434"
        boxShadow="0px 10px 40px rgba(0, 0, 0, 0.25)"
        minW="280px"
        p="16px"
        zIndex={1502}
        onClick={(e) => e.stopPropagation()}
      >
        <VStack spacing="4px" align="stretch">
          {/* Edit Project */}
          <Box
            px="12px"
            py="12px"
            borderRadius="12px"
            cursor="pointer"
            _hover={{
              bg: "rgba(255, 255, 255, 0.05)",
            }}
            onClick={handleEdit}
            display="flex"
            alignItems="center"
            gap="10px"
          >
            <Image
              src={getAssetPath("/icons/edit.svg")}
              alt="Edit"
              width={16}
              height={16}
            />
            <Text
              fontSize="16px"
              color="white"
              fontWeight="500"
              lineHeight="20px"
            >
              Переименовать проект
            </Text>
          </Box>

          {/* Divider */}
          <Box h="1px" bg="#343434" mx="12px" />

          {/* Delete Project */}
          <Box
            px="12px"
            py="12px"
            borderRadius="12px"
            cursor="pointer"
            _hover={{
              bg: "rgba(255, 0, 0, 0.05)",
            }}
            onClick={handleDeleteClick}
            display="flex"
            alignItems="center"
            gap="10px"
          >
            <Image
              src={getAssetPath("/icons/trash.svg")}
              alt="Delete"
              width={16}
              height={16}
            />
            <Text
              fontSize="16px"
              color="#ff4444"
              fontWeight="500"
              lineHeight="20px"
            >
              Удалить проект
            </Text>
          </Box>
        </VStack>
      </Box>

      <DeleteProjectConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        projectName={projectName}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
