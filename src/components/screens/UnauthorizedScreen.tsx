"use client";
import React from "react";
import { Box, VStack, Text, Icon } from "@chakra-ui/react";
import { COLORS } from "@/theme/colors";
import { MdBlock } from "react-icons/md";

export function UnauthorizedScreen() {
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
      <VStack spacing="32px" textAlign="center" maxW="400px" px="20px">
        {/* Block icon */}
        <Box
          w="120px"
          h="120px"
          borderRadius="20px"
          bg="red.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 8px 32px rgba(220, 38, 38, 0.3)"
        >
          <Icon as={MdBlock} w="60px" h="60px" color="white" />
        </Box>

        {/* Error message */}
        <VStack spacing="16px">
          <Text
            fontSize="24px"
            fontWeight="bold"
            color={COLORS.TEXT_PRIMARY}
            fontFamily="'Gantari', sans-serif"
          >
            Вход только через Telegram
          </Text>

          <Text color={COLORS.TEXT_SECONDARY} fontSize="16px" lineHeight="1.5">
            Это приложение работает только внутри Telegram. Пожалуйста, откройте
            его через Telegram Web App.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}
