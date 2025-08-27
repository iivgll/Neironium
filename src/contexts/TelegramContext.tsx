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
  user: MOCK_TELEGRAM_USER, // Start with mock data to avoid loading
  isLoading: false, // No loading by default
  isTelegramEnvironment: false,
  displayName: 'Разработчик',
};

const TelegramContext = createContext<TelegramContextType>(defaultTelegramContext);

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  // Initialize with mock data for development
  const [user, setUser] = useState<TelegramWebAppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Don't block on load
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log('🔍 TelegramContext: Checking environment...');
    console.log('isDevelopment:', isDevelopment);
    
    // Load Telegram script asynchronously if not already loaded
    if (typeof window !== 'undefined' && !window.Telegram && !isDevelopment) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = () => {
        console.log('📲 Telegram WebApp script loaded dynamically');
        checkTelegramEnvironment();
      };
      document.head.appendChild(script);
    } else {
      // Check immediately if already loaded or in development
      checkTelegramEnvironment();
    }
    
    function checkTelegramEnvironment() {
      console.log('window.Telegram:', window.Telegram);
      
      const telegramWebApp = window.Telegram?.WebApp;
      
      console.log('📱 Telegram WebApp object:', telegramWebApp);
      console.log('📊 InitData:', telegramWebApp?.initData);
      console.log('📊 InitDataUnsafe:', telegramWebApp?.initDataUnsafe);
      console.log('👤 User data:', telegramWebApp?.initDataUnsafe?.user);
      
      if (telegramWebApp && telegramWebApp.initDataUnsafe?.user) {
        console.log('✅ Telegram user detected!');
        console.log('User details:', {
          id: telegramWebApp.initDataUnsafe.user.id,
          first_name: telegramWebApp.initDataUnsafe.user.first_name,
          last_name: telegramWebApp.initDataUnsafe.user.last_name,
          username: telegramWebApp.initDataUnsafe.user.username,
          language_code: telegramWebApp.initDataUnsafe.user.language_code,
        });
        
        setIsTelegramEnvironment(true);
        setUser(telegramWebApp.initDataUnsafe.user);
        telegramWebApp.ready();
      } else if (isDevelopment) {
        console.log('🚧 Development mode - using mock data');
        console.log('Mock user:', MOCK_TELEGRAM_USER);
        setUser(MOCK_TELEGRAM_USER);
      } else {
        console.log('⚠️ Not in Telegram environment and not in development');
      }
    }
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