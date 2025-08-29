'use client';
import React, { useState, useEffect } from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { COLORS } from '@/theme/colors';
import { MOCK_TELEGRAM_USER } from '@/types/telegram';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.6; transform: scale(0.95); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

export function LoadingScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Предзагрузка аватарки пользователя
    if (MOCK_TELEGRAM_USER.photo_url) {
      const img = new Image();
      img.src = MOCK_TELEGRAM_USER.photo_url;
    }

    // Предзагрузка аватарки ассистента (логотип Nr)
    // Если у вас есть отдельное изображение для ассистента, добавьте здесь
  }, []);

  // На сервере показываем простой плейсхолдер без анимаций
  if (!mounted) {
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
        zIndex={10000}
      >
        <VStack spacing="32px">
          <Box
            w="120px"
            h="120px"
            borderRadius="20px"
            bgGradient={COLORS.GRADIENT_PRIMARY}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 8px 32px rgba(136, 84, 243, 0.4)"
          >
            <Text
              fontSize="48px"
              fontWeight="bold"
              color="white"
              fontFamily="'Gantari', sans-serif"
              letterSpacing="-2px"
            >
              Nr
            </Text>
          </Box>
          <Text color={COLORS.TEXT_SECONDARY} fontSize="lg">
            Инициализация...
          </Text>
        </VStack>
      </Box>
    );
  }

  // После монтирования показываем версию с анимациями
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
      zIndex={10000}
      animation={`${fadeIn} 0.3s ease-in`}
    >
      <VStack spacing="32px">
        {/* Logo/Icon with gradient background */}
        <Box position="relative">
          <Box
            w="120px"
            h="120px"
            borderRadius="20px"
            bgGradient={COLORS.GRADIENT_PRIMARY}
            display="flex"
            alignItems="center"
            justifyContent="center"
            animation={`${pulse} 2s ease-in-out infinite`}
            boxShadow="0 8px 32px rgba(136, 84, 243, 0.4)"
            position="relative"
            overflow="hidden"
          >
            {/* Inner glow effect */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="100%"
              h="100%"
              borderRadius="20px"
              bg="rgba(255, 255, 255, 0.1)"
              filter="blur(20px)"
            />

            {/* NR Logo Text */}
            <Text
              fontSize="48px"
              fontWeight="bold"
              color="white"
              fontFamily="'Gantari', sans-serif"
              letterSpacing="-2px"
              zIndex={1}
            >
              Nr
            </Text>
          </Box>
        </Box>

        {/* Text content */}
        <VStack spacing="12px">
          <Text
            color={COLORS.TEXT_SECONDARY}
            fontSize="lg"
            animation={`${pulse} 1.5s ease-in-out infinite`}
          >
            Инициализация...
          </Text>

          {/* Progress dots */}
          <Box display="flex" gap="8px" mt="16px">
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                w="8px"
                h="8px"
                borderRadius="50%"
                bg={COLORS.ACCENT_VIOLET}
                opacity={0.3}
                animation={`${pulse} 1.5s ease-in-out infinite`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
}
