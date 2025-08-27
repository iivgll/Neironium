'use client';
import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, VStack, Icon, Button } from '@chakra-ui/react';
import { MdWarning, MdMessage } from 'react-icons/md';
import { COLORS } from '@/theme/colors';

interface TelegramGuardProps {
  children: React.ReactNode;
}

export function TelegramGuard({ children }: TelegramGuardProps) {
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(true); // Assume true initially
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Quick check without blocking
    const checkTelegram = () => {
      const hasTelegram = !!window.Telegram?.WebApp?.initDataUnsafe?.user;
      setIsTelegramEnvironment(hasTelegram);
      setIsChecked(true);
    };

    // Check immediately if Telegram is already loaded
    if (window.Telegram) {
      checkTelegram();
    } else {
      // Wait a bit for Telegram to load, but don't block too long
      const timeout = setTimeout(() => {
        checkTelegram();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, []);

  // If not checked yet or in Telegram, show the app
  if (!isChecked || isTelegramEnvironment) {
    return <>{children}</>;
  }

  // Only show restriction if we're sure it's NOT in Telegram
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg={COLORS.BG_PRIMARY}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="20px"
      zIndex={9999}
    >
      <VStack spacing="32px" textAlign="center" maxW="400px" w="100%">
        <Box
          w="80px"
          h="80px"
          borderRadius="50%"
          bg="rgba(255, 193, 7, 0.2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="2px solid #FFC107"
        >
          <Icon as={MdWarning} w="40px" h="40px" color="#FFC107" />
        </Box>

        <VStack spacing="12px">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color={COLORS.TEXT_PRIMARY}
            backgroundImage={COLORS.GRADIENT_PRIMARY}
            backgroundClip="text"
            sx={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Доступ ограничен
          </Text>
          <Text fontSize="lg" color={COLORS.TEXT_SECONDARY} lineHeight="1.5">
            Это приложение работает только внутри Telegram Mini Apps
          </Text>
        </VStack>

        <Box
          bg={COLORS.BG_SECONDARY}
          p="20px"
          borderRadius="12px"
          border={`1px solid ${COLORS.BORDER_SECONDARY}`}
          w="100%"
        >
          <VStack spacing="16px">
            <Flex align="center" gap="12px">
              <Icon as={MdMessage} w="24px" h="24px" color={COLORS.INFO} />
              <Text color={COLORS.TEXT_PRIMARY} fontWeight="medium">
                Как открыть приложение:
              </Text>
            </Flex>
            <VStack spacing="8px" align="start" w="100%">
              <Text color={COLORS.TEXT_SECONDARY} fontSize="sm">
                1. Откройте Telegram
              </Text>
              <Text color={COLORS.TEXT_SECONDARY} fontSize="sm">
                2. Найдите бота @neironium_test_bot
              </Text>
              <Text color={COLORS.TEXT_SECONDARY} fontSize="sm">
                3. Запустите бота и откройте приложение
              </Text>
            </VStack>
          </VStack>
        </Box>

        <Button
          as="a"
          href="https://t.me/neironium_test_bot"
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          w="100%"
          bgGradient={COLORS.GRADIENT_PRIMARY}
          color="white"
          fontWeight="600"
          borderRadius="12px"
          boxShadow="0 8px 32px rgba(136, 84, 243, 0.4)"
          transition="all 0.2s"
          leftIcon={<Icon as={MdMessage} w="20px" h="20px" />}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(136, 84, 243, 0.5)',
          }}
          _active={{
            transform: 'translateY(0px)',
          }}
        >
          Открыть в Telegram
        </Button>

        <Text color={COLORS.TEXT_TERTIARY} fontSize="xs" textAlign="center">
          Neuronium AI работает эксклюзивно в экосистеме Telegram
        </Text>
      </VStack>
    </Box>
  );
}
