'use client';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  Input,
  VStack,
  Text,
  Flex,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { COLORS } from '@/theme/colors';

interface RenameChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName?: string;
}

export default function RenameChatModal({
  isOpen,
  onClose,
  onRename,
  currentName = '',
}: RenameChatModalProps) {
  const [chatName, setChatName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setChatName(currentName);
    }
  }, [isOpen, currentName]);

  const handleRename = () => {
    const trimmedName = chatName.trim();
    if (trimmedName && trimmedName !== currentName) {
      onRename(trimmedName);
      onClose();
    }
  };

  const handleClose = () => {
    setChatName(currentName);
    onClose();
  };

  const isRenameDisabled = !chatName.trim() || chatName.trim() === currentName;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="#121314"
        border="none"
        borderRadius="55px"
        maxW={['90vw', '680px']}
        mx="20px"
        p="0"
      >
        <ModalBody p={['20px', '40px']}>
          <VStack spacing={['30px', '40px']} align="stretch" w="full">
            {/* Header */}
            <Flex align="center" justify="space-between">
              {/* Invisible placeholder for centering */}
              <IconButton
                aria-label="placeholder"
                icon={<MdClose />}
                size="sm"
                variant="ghost"
                opacity={0}
                pointerEvents="none"
              />

              {/* Title */}
              <Text
                fontSize={['18px', '24px']}
                fontWeight="700"
                color={COLORS.TEXT_PRIMARY}
                lineHeight={['18px', '24px']}
                textAlign="center"
              >
                Переименовать чат
              </Text>

              {/* Close Button */}
              <IconButton
                aria-label="Close modal"
                icon={<MdClose size="16px" />}
                size="sm"
                variant="ghost"
                color={COLORS.TEXT_PRIMARY}
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                onClick={handleClose}
                borderRadius="100px"
                w="36px"
                h="36px"
              />
            </Flex>

            {/* Form Content */}
            <VStack spacing="20px" align="stretch">
              {/* Input Section */}
              <VStack spacing="6px" align="stretch">
                <Text
                  fontSize="12px"
                  color="rgba(247,248,250,0.5)"
                  letterSpacing="-0.4px"
                  lineHeight="12px"
                >
                  Название чата
                </Text>
                <Input
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="Введите новое название чата"
                  bg="#1e1e1e"
                  border="1px solid white"
                  borderRadius="12px"
                  h="54px"
                  px="10px"
                  color="#8c8c8c"
                  fontSize="16px"
                  letterSpacing="-0.4px"
                  _placeholder={{ color: '#8c8c8c' }}
                  _hover={{ borderColor: 'white' }}
                  _focus={{
                    borderColor: 'white',
                    boxShadow: 'none',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isRenameDisabled) {
                      handleRename();
                    }
                    if (e.key === 'Escape') {
                      handleClose();
                    }
                  }}
                  autoFocus
                />
              </VStack>
            </VStack>

            {/* Footer Buttons */}
            <Flex justify="flex-end" gap="16px" direction={['column', 'row']}>
              <Button
                bg="#343434"
                color={COLORS.TEXT_PRIMARY}
                borderRadius="100px"
                h="54px"
                px="20px"
                py="16px"
                fontWeight="700"
                fontSize="16px"
                _hover={{ bg: 'rgba(52, 52, 52, 0.8)' }}
                _active={{ bg: 'rgba(52, 52, 52, 0.6)' }}
                onClick={handleClose}
                order={[2, 1]}
              >
                Отменить
              </Button>
              <Button
                bg={isRenameDisabled ? 'rgba(255, 255, 255, 0.5)' : 'white'}
                color="#1d1e20"
                borderRadius="100px"
                h="54px"
                px="20px"
                py="16px"
                fontWeight="700"
                fontSize="16px"
                isDisabled={isRenameDisabled}
                _hover={
                  !isRenameDisabled ? { bg: 'rgba(255, 255, 255, 0.9)' } : {}
                }
                _active={
                  !isRenameDisabled ? { bg: 'rgba(255, 255, 255, 0.8)' } : {}
                }
                onClick={handleRename}
                order={[1, 2]}
              >
                Переименовать
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
