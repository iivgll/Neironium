"use client";
import React, { useState } from "react";
import { Box, VStack, Text, Button } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { COLORS } from "@/theme/colors";
import { useAuth } from "@/contexts/AuthContext";

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.6; transform: scale(0.95); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

export function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  };

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
      <VStack spacing="32px" maxW="300px" textAlign="center">
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
            animation={
              isLoading ? `${pulse} 2s ease-in-out infinite` : undefined
            }
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

        {/* Welcome text */}
        <VStack spacing="12px">
          <Text color={COLORS.TEXT_PRIMARY} fontSize="2xl" fontWeight="bold">
            Добро пожаловать в Neuronium
          </Text>

          <Text color={COLORS.TEXT_SECONDARY} fontSize="md" lineHeight="1.5">
            Ваш персональный AI-ассистент готов помочь в решении любых задач
          </Text>
        </VStack>

        {/* Error message */}
        {error && (
          <Text
            color="red.400"
            fontSize="sm"
            bg="rgba(255, 0, 0, 0.1)"
            px="16px"
            py="8px"
            borderRadius="8px"
            border="1px solid rgba(255, 0, 0, 0.2)"
          >
            {error}
          </Text>
        )}

        {/* Login button */}
        <Button
          onClick={handleLogin}
          isLoading={isLoading || isLoggingIn}
          loadingText="Авторизация..."
          bgGradient={COLORS.GRADIENT_PRIMARY}
          color="white"
          size="lg"
          px="32px"
          py="12px"
          borderRadius="12px"
          _hover={{
            bgGradient: "linear(to-r, brand.400, purple.400)",
            transform: "translateY(-1px)",
            boxShadow: "0 12px 40px rgba(136, 84, 243, 0.5)",
          }}
          _active={{
            transform: "translateY(0)",
          }}
          transition="all 0.2s ease"
          boxShadow="0 8px 32px rgba(136, 84, 243, 0.3)"
        >
          Войти через Telegram
        </Button>

        {/* Loading dots when authenticating */}
        {(isLoading || isLoggingIn) && (
          <Box display="flex" gap="8px">
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
        )}
      </VStack>
    </Box>
  );
}
