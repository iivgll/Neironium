'use client';
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react';
import { COLORS } from '@/theme/colors';

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatTitle?: string;
}

export default function DeleteChatModal({
  isOpen,
  onClose,
  onConfirm,
  chatTitle = '',
}: DeleteChatModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="#121314"
        border="none"
        borderRadius="55px"
        maxW="480px"
        mx="20px"
        p="0"
      >
        <ModalBody p="40px">
          <VStack spacing="40px" align="stretch">
            {/* Content */}
            <VStack spacing="40px" align="center">
              {/* Title */}
              <Text
                fontSize="24px"
                fontWeight="700"
                color={COLORS.TEXT_PRIMARY}
                lineHeight="24px"
                textAlign="center"
              >
                Удалить чат?
              </Text>

              {/* Description */}
              <Text
                fontSize="16px"
                color={COLORS.TEXT_SECONDARY}
                lineHeight="22px"
                textAlign="center"
                maxW="100%"
              >
                Вся история переписки в чате{' '}
                <Text as="span" fontWeight="700" color={COLORS.TEXT_PRIMARY}>
                  «{chatTitle}»
                </Text>{' '}
                будет стерта без возможности восстановления.
              </Text>
            </VStack>

            {/* Buttons */}
            <HStack spacing="16px" w="100%">
              <Button
                flex="1"
                bg="#343434"
                color={COLORS.TEXT_PRIMARY}
                borderRadius="100px"
                h="54px"
                px="32px"
                py="16px"
                fontWeight="700"
                fontSize="16px"
                _hover={{ bg: 'rgba(52, 52, 52, 0.8)' }}
                _active={{ bg: 'rgba(52, 52, 52, 0.6)' }}
                onClick={onClose}
              >
                Отменить
              </Button>

              <Button
                flex="1"
                bg="#d05e5e"
                color={COLORS.TEXT_PRIMARY}
                borderRadius="100px"
                h="54px"
                px="32px"
                py="16px"
                fontWeight="700"
                fontSize="16px"
                lineHeight="22px"
                _hover={{ bg: 'rgba(208, 94, 94, 0.8)' }}
                _active={{ bg: 'rgba(208, 94, 94, 0.6)' }}
                onClick={handleConfirm}
              >
                Удалить
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
