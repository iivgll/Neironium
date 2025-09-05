'use client';
import React from 'react';
import { Box } from '@chakra-ui/react';
import NeuroniumNavbar from '@/components/navbar/NeuroniumNavbar';
import TelegramDebugPanel from '@/components/telegram/TelegramDebugPanel';
import { COLORS } from '@/theme/colors';

export default function TelegramDebugPage() {
  return (
    <Box
      h="100%"
      bg={COLORS.BG_PRIMARY}
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <NeuroniumNavbar 
        model="gpt-4o" 
        onModelChange={() => {}} 
        hideModelSelector={true} 
      />
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        position="relative"
        pt="60px"
        overflow="hidden"
      >
        <Box
          flex="1"
          overflowY="auto"
          px={{ base: '16px', md: '32px' }}
          maxW="1200px"
          w="100%"
          mx="auto"
          py="20px"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <TelegramDebugPanel />
        </Box>
      </Box>
    </Box>
  );
}