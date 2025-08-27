'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import { ChakraProvider } from '@chakra-ui/react';
import { TelegramProvider, useTelegram } from '@/contexts/TelegramContext';
import { ClientLoadingScreen } from '@/components/ClientLoadingScreen';
import theme from '@/theme/theme';

function AppContent({ children }: { children: ReactNode }) {
  const { isLoading } = useTelegram();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // На сервере и до монтирования просто возвращаем children
  if (!mounted) {
    return <>{children}</>;
  }
  
  // После монтирования показываем загрузку если нужно
  if (isLoading) {
    return <ClientLoadingScreen />;
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
