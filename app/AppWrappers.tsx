'use client';
import React, { ReactNode } from 'react';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import { ChakraProvider } from '@chakra-ui/react';
import { TelegramProvider, useTelegram } from '@/contexts/TelegramContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import theme from '@/theme/theme';

function AppContent({ children }: { children: ReactNode }) {
  const { isLoading } = useTelegram();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return <>{children}</>;
}

export default function AppWrappers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <TelegramProvider>
        <AppContent>{children}</AppContent>
      </TelegramProvider>
    </ChakraProvider>
  );
}
