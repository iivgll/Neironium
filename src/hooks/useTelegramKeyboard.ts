'use client';
import { useEffect, useState, useCallback } from 'react';

export const useTelegramKeyboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Проверяем, доступен ли Telegram WebApp API
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Настройка Telegram WebApp
      tg.ready();
      tg.expand(); // Разворачиваем приложение на весь экран

      // Включаем режим, который корректно обрабатывает клавиатуру
      if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
        // Устанавливаем цвет заголовка
        tg.setHeaderColor('#151515');
        tg.setBackgroundColor('#151515');
      }

      // Отслеживаем изменения viewport
      const handleViewportChanged = () => {
        const viewportHeight = tg.viewportHeight;
        const viewportStableHeight = tg.viewportStableHeight;

        // Обновляем CSS переменные
        if (viewportHeight && viewportStableHeight) {
          document.documentElement.style.setProperty(
            '--tg-viewport-height',
            `${viewportHeight}px`,
          );
          document.documentElement.style.setProperty(
            '--tg-viewport-stable-height',
            `${viewportStableHeight}px`,
          );

          // Определяем, открыта ли клавиатура
          const keyboardHeight = viewportStableHeight - viewportHeight;
          setIsExpanded(keyboardHeight > 100);
        }
      };

      // Подписываемся на события
      tg.onEvent('viewportChanged', handleViewportChanged);

      // Инициализируем значения
      handleViewportChanged();

      return () => {
        tg.offEvent('viewportChanged', handleViewportChanged);
      };
    }
  }, []);

  const requestWriteAccess = useCallback(() => {
    if (window.Telegram?.WebApp?.requestWriteAccess) {
      window.Telegram.WebApp.requestWriteAccess();
    }
  }, []);

  const disableVerticalSwipes = useCallback(() => {
    if (window.Telegram?.WebApp?.disableVerticalSwipes) {
      window.Telegram.WebApp.disableVerticalSwipes();
    }
  }, []);

  const enableVerticalSwipes = useCallback(() => {
    if (window.Telegram?.WebApp?.enableVerticalSwipes) {
      window.Telegram.WebApp.enableVerticalSwipes();
    }
  }, []);

  return {
    isExpanded,
    requestWriteAccess,
    disableVerticalSwipes,
    enableVerticalSwipes,
  };
};
