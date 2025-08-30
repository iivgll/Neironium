'use client';
import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import Image from 'next/image';
import { COLORS } from '@/theme/colors';
import { validateProjectName, sanitizeString } from '@/utils/validation';
import { useAssetPath } from '@/hooks/useAssetPath';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject?: (projectName: string) => void;
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [validationError, setValidationError] = useState<string>('');
  const { getAssetPath } = useAssetPath();

  // Memoize validation to avoid duplicate calculations
  const validation = React.useMemo(
    () => validateProjectName(projectName),
    [projectName],
  );
  const isCreateDisabled = !validation.isValid;

  const handleCreate = () => {
    if (!validation.isValid) {
      setValidationError(validation.error || 'Неверное название проекта');
      return;
    }

    try {
      const sanitizedName = sanitizeString(projectName.trim());
      onCreateProject?.(sanitizedName);
      setProjectName('');
      setValidationError('');
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setValidationError('Произошла ошибка при создании проекта');
    }
  };

  const handleClose = () => {
    setProjectName('');
    setValidationError('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

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
                fontSize={['18px', '24px']}
                fontWeight="700"
                color={COLORS.TEXT_PRIMARY}
                lineHeight={['18px', '24px']}
                textAlign="center"
              >
                Новый проект
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
                  Название проекта
                </Text>
                <Box position="relative">
                  <Input
                    value={projectName}
                    onChange={handleInputChange}
                    placeholder="Статья на Хабр"
                    isInvalid={!!validationError}
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
                      if (e.key === 'Enter' && !isCreateDisabled) {
                        handleCreate();
                      }
                    }}
                  />
                  {/* Cursor Line */}
                  <Box
                    position="absolute"
                    left="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    w="2px"
                    h="16px"
                    bg="white"
                    opacity={projectName ? 0 : 1}
                    sx={{
                      '@keyframes blink': {
                        '0%, 50%': { opacity: 1 },
                        '51%, 100%': { opacity: 0 },
                      },
                      animation: projectName ? 'none' : 'blink 1s infinite',
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

              {/* Info Section */}
              <Box bg="rgba(255,255,255,0.05)" borderRadius="20px" p="20px">
                <Flex align="flex-start" gap="10px">
                  <Image
                    src={getAssetPath('/icons/idea.svg')}
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
                bg={isCreateDisabled ? 'rgba(255, 255, 255, 0.5)' : 'white'}
                color="#1d1e20"
                borderRadius="100px"
                h="54px"
                px="20px"
                py="16px"
                fontWeight="700"
                fontSize="16px"
                isDisabled={isCreateDisabled}
                _hover={
                  !isCreateDisabled ? { bg: 'rgba(255, 255, 255, 0.9)' } : {}
                }
                _active={
                  !isCreateDisabled ? { bg: 'rgba(255, 255, 255, 0.8)' } : {}
                }
                onClick={handleCreate}
                order={[1, 2]}
              >
                Создать проект
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>

      {/* Global styles moved to sx prop in Box component */}
    </Modal>
  );
}
