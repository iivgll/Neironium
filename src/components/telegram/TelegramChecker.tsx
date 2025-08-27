'use client';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load the guard component only in production
const TelegramGuard = dynamic(
  () => import('./TelegramGuard').then(mod => ({ default: mod.TelegramGuard })),
  { 
    ssr: false,
    loading: () => null // Don't show loading, just render nothing
  }
);

interface TelegramCheckerProps {
  children: React.ReactNode;
}

export function TelegramChecker({ children }: TelegramCheckerProps) {
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    // Load Telegram script only in production and if not already loaded
    if (isProduction && typeof window !== 'undefined' && !window.Telegram) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, [isProduction]);

  // In development, just show the app
  if (!isProduction) {
    return <>{children}</>;
  }

  // In production, check Telegram environment
  return <TelegramGuard>{children}</TelegramGuard>;
}