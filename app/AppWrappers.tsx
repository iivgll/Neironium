"use client";
import React, { ReactNode } from "react";
import "@/styles/App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { TelegramProvider, useTelegram } from "@/contexts/TelegramContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { ChatsProvider } from "@/contexts/ChatsContext";
import { LoadingScreen } from "@/components/screens/LoadingScreen";
import { UnauthorizedScreen } from "@/components/screens/UnauthorizedScreen";
import { LoginScreen } from "@/components/screens/LoginScreen";
import theme from "@/theme/theme";

function AppContent({ children }: { children: ReactNode }) {
  const { isLoading: telegramLoading, isUnauthorized } = useTelegram();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Show loading screen while initializing Telegram or auth
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
          <ProjectsProvider>
            <ChatsProvider>
              <AppContent>{children}</AppContent>
            </ChatsProvider>
          </ProjectsProvider>
        </AuthProvider>
      </TelegramProvider>
    </ChakraProvider>
  );
}
