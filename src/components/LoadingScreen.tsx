'use client';
import React from 'react';
import { Box, VStack, Text, Icon, keyframes } from '@chakra-ui/react';
import { MdMessage } from 'react-icons/md';
import { COLORS } from '@/theme/colors';

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
            borderRadius="50%"
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
              borderRadius="50%"
              bg="rgba(255, 255, 255, 0.1)"
              filter="blur(20px)"
            />
            
            <Icon 
              as={MdMessage} 
              w="50px" 
              h="50px" 
              color="white"
              zIndex={1}
            />
          </Box>
          
          {/* Rotating ring */}
          <Box
            position="absolute"
            top="-10px"
            left="-10px"
            right="-10px"
            bottom="-10px"
            borderRadius="50%"
            border="2px solid transparent"
            borderTopColor={COLORS.ACCENT_VIOLET}
            animation={`${spin} 1.5s linear infinite`}
          />
        </Box>

        {/* Text content */}
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
            Neuronium AI
          </Text>
          
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
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
}