"use client";
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  VStack,
  Box,
  Text,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { MdClose } from "react-icons/md";
import Image from "next/image";
import { COLORS } from "@/theme/colors";
import { useAssetPath } from "@/hooks/useAssetPath";

interface DeleteProjectConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onConfirm: () => void;
}

export default function DeleteProjectConfirmModal({
  isOpen,
  onClose,
  projectName,
  onConfirm,
}: DeleteProjectConfirmModalProps) {
  const { getAssetPath } = useAssetPath();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="#121314"
        border="none"
        borderRadius="55px"
        maxW={["90vw", "680px"]}
        mx="20px"
        p="0"
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
                Удалить проект?
              </Text>

              {/* Close Button */}
              <IconButton
                aria-label="Close modal"
                icon={<MdClose size="16px" />}
                size="sm"
                variant="ghost"
                color={COLORS.TEXT_PRIMARY}
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                onClick={onClose}
                borderRadius="100px"
                w="36px"
                h="36px"
              />
            </Flex>

            {/* Content */}
            <VStack spacing="20px" align="stretch">
              {/* Warning Section */}
              <Box bg="rgba(255, 68, 68, 0.1)" borderRadius="20px" p="20px">
                <Flex align="flex-start" gap="10px">
                  <Image
                    src={getAssetPath("/icons/warning.svg")}
                    alt="Warning"
                    width={24}
                    height={24}
                  />
                  <VStack spacing="8px" align="stretch" flex="1">
                    <Text
                      fontSize="16px"
                      fontWeight="700"
                      color="#ff4444"
                      lineHeight="22px"
                    >
                      Это действие нельзя отменить
                    </Text>
                    <Text
                      fontSize="16px"
                      color="#8a8b8c"
                      lineHeight="22px"
                      letterSpacing="-0.4px"
                    >
                      Проект {projectName} и все связанные с ним чаты будут
                      безвозвратно удалены. Убедитесь, что вы действительно
                      хотите продолжить.
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
                onClick={onClose}
                order={[2, 1]}
              >
                Отменить
              </Button>
              <Button
                bg="#ff4444"
                color="white"
                borderRadius="100px"
                h="54px"
                px="20px"
                py="16px"
                fontWeight="700"
                fontSize="16px"
                _hover={{ bg: "rgba(255, 68, 68, 0.9)" }}
                _active={{ bg: "rgba(255, 68, 68, 0.8)" }}
                onClick={handleConfirm}
                order={[1, 2]}
              >
                Удалить проект
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
