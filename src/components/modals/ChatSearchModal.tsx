'use client';
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  VStack,
  Box,
  Text,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { MdSearch, MdClose } from 'react-icons/md';
import Image from 'next/image';
import { COLORS } from '@/theme/colors';

interface ChatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatResult {
  id: string;
  title: string;
  lastMessage: string;
  date: string;
  tags?: string[];
}

// Примеры данных для демонстрации
const mockChatResults: ChatResult[] = [
  {
    id: '1',
    title: 'Создание статей для Хабра',
    lastMessage: 'Как лучше структурировать статью о машинном обучении?',
    date: '2 часа назад',
    tags: ['Разработка', 'AI'],
  },
  {
    id: '2',
    title: 'Планирование проекта',
    lastMessage: 'Нужно определить основные этапы разработки',
    date: 'Вчера',
    tags: ['Планирование'],
  },
  {
    id: '3',
    title: 'Дизайн системы',
    lastMessage: 'Обсуждение цветовой палитры и компонентов',
    date: '3 дня назад',
    tags: ['Дизайн', 'UI/UX'],
  },
];

export default function ChatSearchModal({
  isOpen,
  onClose,
}: ChatSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] =
    useState<ChatResult[]>(mockChatResults);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredResults(mockChatResults);
    } else {
      const filtered = mockChatResults.filter(
        (chat) =>
          chat.title.toLowerCase().includes(query.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredResults(filtered);
    }
  };

  const handleChatSelect = (chatId: string) => {
    console.log('Selected chat:', chatId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg={COLORS.BG_PRIMARY}
        border="1px solid"
        borderColor={COLORS.BORDER_PRIMARY}
        borderRadius="16px"
        maxW="600px"
        mx="20px"
      >
        <ModalHeader
          pb="16px"
          pt="24px"
          px="24px"
          borderBottom="1px solid"
          borderColor={COLORS.BORDER_SECONDARY}
          textAlign="center"
        >
          <Text fontSize="20px" fontWeight="600" color={COLORS.TEXT_PRIMARY}>
            Поиск в чатах
          </Text>
        </ModalHeader>

        <ModalCloseButton
          color={COLORS.TEXT_PRIMARY}
          _hover={{ bg: COLORS.BG_HOVER }}
          top="24px"
          right="24px"
        />

        <ModalBody p="24px" pt="20px">
          <VStack spacing="20px" align="stretch">
            {/* Search Input */}
            <InputGroup>
              <Input
                placeholder="Поиск по чатам..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                bg={COLORS.BG_SECONDARY}
                border="1px solid"
                borderColor={COLORS.BORDER_PRIMARY}
                borderRadius="12px"
                h="48px"
                pl="16px"
                pr="48px"
                color={COLORS.TEXT_PRIMARY}
                fontSize="16px"
                _placeholder={{ color: COLORS.TEXT_SECONDARY }}
                _hover={{ borderColor: COLORS.BORDER_SECONDARY }}
                _focus={{
                  borderColor: COLORS.ACCENT_VIOLET,
                  boxShadow: `0 0 0 1px ${COLORS.ACCENT_VIOLET}`,
                }}
              />
              <Box
                position="absolute"
                right="16px"
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
              >
                <Image
                  src="/icons/magnifer.svg"
                  alt="search"
                  width={20}
                  height={20}
                />
              </Box>
            </InputGroup>

            {/* Results Section */}
            <Box>
              {searchQuery && (
                <Text fontSize="14px" color={COLORS.TEXT_SECONDARY} mb="16px">
                  Найдено результатов: {filteredResults.length}
                </Text>
              )}

              <VStack spacing="0" align="stretch" maxH="400px" overflowY="auto">
                {filteredResults.map((chat, index) => (
                  <React.Fragment key={chat.id}>
                    <Flex
                      p="16px"
                      align="center"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: COLORS.BG_HOVER,
                      }}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <Image
                        src="/icons/chat.svg"
                        alt="chat"
                        width={20}
                        height={20}
                        style={{ marginRight: '12px' }}
                      />
                      <Text
                        fontSize="16px"
                        fontWeight="500"
                        color={COLORS.TEXT_PRIMARY}
                        noOfLines={1}
                        flex="1"
                      >
                        {chat.title}
                      </Text>
                    </Flex>
                    {index < filteredResults.length - 1 && (
                      <Divider borderColor={COLORS.BORDER_SECONDARY} />
                    )}
                  </React.Fragment>
                ))}

                {filteredResults.length === 0 && (
                  <Box py="40px" textAlign="center">
                    <Text
                      fontSize="16px"
                      color={COLORS.TEXT_SECONDARY}
                      mb="8px"
                    >
                      Ничего не найдено
                    </Text>
                    <Text fontSize="14px" color={COLORS.TEXT_TERTIARY}>
                      Попробуйте изменить запрос
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
