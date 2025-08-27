'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import routes from '@/routes';
import NeuroniumSidebar from '@/components/sidebar/NeuroniumSidebar';
import { SidebarContext } from '@/contexts/SidebarContext';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return minimal layout during SSR
  if (!mounted) {
    return (
      <SidebarContext.Provider value={{ 
        toggleSidebar, 
        setToggleSidebar,
        sidebarWidth: 300,
        isCollapsed, 
        setIsCollapsed 
      }}>
        <Box h="100vh" overflow="hidden" position="relative">
          {children}
        </Box>
      </SidebarContext.Provider>
    );
  }

  const isAuthPage = pathname?.includes('register') || pathname?.includes('sign-in');

  return (
    <SidebarContext.Provider value={{ 
      toggleSidebar, 
      setToggleSidebar,
      sidebarWidth: 300,
      isCollapsed, 
      setIsCollapsed 
    }}>
      {isAuthPage ? (
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
  );
}