'use client';
import React, { ReactNode } from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider, Box, useDisclosure } from '@chakra-ui/react';
import theme from '@/theme/theme';
import routes from '@/routes';
import NeuroniumSidebar, { NeuroniumSidebarResponsive } from '@/components/sidebar/NeuroniumSidebar';
import { SidebarContext } from '@/contexts/SidebarContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import AppWrappers from './AppWrappers';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [apiKey, setApiKey] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    const initialKey = localStorage.getItem('apiKey');
    if (initialKey?.includes('sk-') && apiKey !== initialKey) {
      setApiKey(initialKey);
    }
  }, [apiKey]);

  return (
    <html lang="en" style={{ height: '100%' }}>
      <body id={'root'} style={{ height: '100%', overflow: 'hidden' }}>
        <AppWrappers>
          <SidebarContext.Provider value={{ 
            toggleSidebar, 
            setToggleSidebar,
            sidebarWidth: 300,
            isCollapsed, 
            setIsCollapsed 
          }}>
            {pathname?.includes('register') || pathname?.includes('sign-in') ? (
              children
            ) : (
              <Box h="100vh" overflow="hidden" position="relative">
                <NeuroniumSidebar routes={routes} />
                <Box
                  position="absolute"
                  top="0"
                  right="0"
                  bottom="0"
                  left={{ base: 0, lg: isCollapsed ? '68px' : '300px' }}
                  overflow="hidden"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {children}
                </Box>
              </Box>
            )}
          </SidebarContext.Provider>
        </AppWrappers>
      </body>
    </html>
  );
}
