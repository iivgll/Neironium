'use client';
import React, { ReactNode } from 'react';
import '@/styles/App.css';
import { ChakraProvider } from '@chakra-ui/react';
import { TelegramProvider, useTelegram } from '@/contexts/TelegramContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { UnauthorizedScreen } from '@/components/UnauthorizedScreen';
import theme from '@/theme/theme';

function AppContent({ children }: { children: ReactNode }) {
  const { isLoading, isUnauthorized } = useTelegram();

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show unauthorized screen if not accessed from Telegram
  if (isUnauthorized) {
    return <UnauthorizedScreen />;
  }

  return <>{children}</>;
}

export default function AppWrappers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={theme} cssVarsRoot="body" resetCSS>
      <TelegramProvider>
        <AppContent>{children}</AppContent>
      </TelegramProvider>
    </ChakraProvider>
  );
}
