'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { TelegramWebAppUser, MOCK_TELEGRAM_USER } from '@/types/telegram';

interface TelegramContextType {
  user: TelegramWebAppUser | null;
  isLoading: boolean;
  isTelegramEnvironment: boolean;
  displayName: string;
}

const defaultTelegramContext: TelegramContextType = {
  user: null,
  isLoading: true,
  isTelegramEnvironment: false,
  displayName: 'Гость',
};

const TelegramContext = createContext<TelegramContextType>(defaultTelegramContext);

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  // Initialize states
  const [user, setUser] = useState<TelegramWebAppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false to avoid hydration issues
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoading(true); // Set loading after mount
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Add a small delay to show the loading screen
    const initTimer = setTimeout(() => {
      // Load Telegram script asynchronously if not already loaded
      if (typeof window !== 'undefined' && !window.Telegram && !isDevelopment) {
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-web-app.js';
        script.async = true;
        script.onload = () => {
          checkTelegramEnvironment();
        };
        script.onerror = () => {
          console.error('❌ Failed to load Telegram WebApp script');
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } else {
        // Check immediately if already loaded or in development
        checkTelegramEnvironment();
      }
    }, 300); // Small delay to ensure smooth loading animation
    
    function checkTelegramEnvironment() {
      const telegramWebApp = window.Telegram?.WebApp;
      
      if (telegramWebApp && telegramWebApp.initDataUnsafe?.user) {
        setIsTelegramEnvironment(true);
        setUser(telegramWebApp.initDataUnsafe.user);
        telegramWebApp.ready();
        
        // Small delay before hiding loading for smoother transition
        setTimeout(() => setIsLoading(false), 500);
      } else if (isDevelopment) {
        setUser(MOCK_TELEGRAM_USER);
        // Add delay in dev to see loading animation
        setTimeout(() => setIsLoading(false), 1000);
      } else {
        setIsLoading(false);
      }
    }
    
    return () => clearTimeout(initTimer);
  }, []);

  // Generate display name based on user data
  const displayName = useMemo(() => {
    if (!user) return 'Гость';
    
    // Try to use first_name + last_name
    if (user.first_name) {
      return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    }
    
    // Fallback to username
    if (user.username) {
      return user.username;
    }
    
    // Final fallback
    return 'Гость';
  }, [user]);

  const contextValue: TelegramContextType = {
    user,
    isLoading,
    isTelegramEnvironment,
    displayName,
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextType {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}