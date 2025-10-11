"use client";
import React, { ReactNode, useState, useEffect } from "react";
import "@/styles/App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { TelegramProvider, useTelegram } from "@/contexts/TelegramContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChatsProvider } from "@/contexts/ChatsContext";
import { ChatDetailsProvider } from "@/contexts/ChatDetailsContext";
import { LoadingScreen } from "@/components/screens/LoadingScreen";
import { UnauthorizedScreen } from "@/components/screens/UnauthorizedScreen";
import { LoginScreen } from "@/components/screens/LoginScreen";
import theme from "@/theme/theme";

function AppContent({ children }: { children: ReactNode }) {
  const { isLoading: telegramLoading, isUnauthorized } = useTelegram();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration error by waiting for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading screen while mounting or initializing
  if (!isMounted) {
    return null; // Return null to avoid hydration mismatch
  }

  if (telegramLoading || authLoading) {
    return <LoadingScreen />;
  }

  // Show unauthorized screen if not accessed from Telegram
  if (isUnauthorized) {
    return <UnauthorizedScreen />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

export default function AppWrappers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={theme} cssVarsRoot="body" resetCSS>
      <TelegramProvider>
        <AuthProvider>
          <ChatsProvider>
            <ChatDetailsProvider>
              <AppContent>{children}</AppContent>
            </ChatDetailsProvider>
          </ChatsProvider>
        </AuthProvider>
      </TelegramProvider>
    </ChakraProvider>
  );
}
