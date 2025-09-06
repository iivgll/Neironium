"use client";
import { useEffect, useState, useRef, useCallback } from "react";

interface UseKeyboardHandlerOptions {
  enableScrollIntoView?: boolean;
  scrollOffset?: number;
}

export const useKeyboardHandler = (options: UseKeyboardHandlerOptions = {}) => {
  const { enableScrollIntoView = true } = options;

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Определение типа устройства
  const isIOS = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
  }, []);

  const isAndroid = useCallback(() => {
    if (typeof window === "undefined") return false;
    return /Android/.test(navigator.userAgent);
  }, []);

  const isTelegram = useCallback(() => {
    return typeof window !== "undefined" && window.Telegram?.WebApp;
  }, []);

  // Обработка изменения размера viewport (для iOS и Android)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastHeight = window.innerHeight;
    let resizeTimeout: NodeJS.Timeout;

    const handleViewportChange = () => {
      clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const visualViewport = window.visualViewport;

        // Специальная обработка для Telegram WebApp
        if (isTelegram() && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          const viewportHeight = tg.viewportHeight || currentHeight;
          const viewportStableHeight = tg.viewportStableHeight || lastHeight;
          const keyboardHeight = viewportStableHeight - viewportHeight;

          if (keyboardHeight > 50) {
            setKeyboardHeight(keyboardHeight);
            setIsKeyboardVisible(true);

            if (enableScrollIntoView && inputRef.current) {
              scrollTimeoutRef.current = setTimeout(() => {
                inputRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                });
              }, 300);
            }
          } else {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
          }
          return;
        }

        // Используем Visual Viewport API если доступен
        if (visualViewport) {
          const keyboardHeight = window.innerHeight - visualViewport.height;

          if (keyboardHeight > 50) {
            setKeyboardHeight(keyboardHeight);
            setIsKeyboardVisible(true);

            // Прокрутка к полю ввода при появлении клавиатуры
            if (enableScrollIntoView && inputRef.current) {
              scrollTimeoutRef.current = setTimeout(() => {
                inputRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                });
              }, 300);
            }
          } else {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
          }
        } else {
          // Fallback для старых браузеров
          const heightDifference = lastHeight - currentHeight;

          if (heightDifference > 100) {
            setKeyboardHeight(heightDifference);
            setIsKeyboardVisible(true);
          } else if (currentHeight >= lastHeight - 50) {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
          }
        }

        lastHeight = currentHeight;
      }, 100);
    };

    // Подписка на события
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }

    window.addEventListener("resize", handleViewportChange);

    // Для Android - дополнительно отслеживаем фокус
    if (isAndroid()) {
      const handleFocus = () => {
        setTimeout(handleViewportChange, 300);
      };

      const handleBlur = () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      };

      document.addEventListener("focusin", handleFocus);
      document.addEventListener("focusout", handleBlur);

      return () => {
        document.removeEventListener("focusin", handleFocus);
        document.removeEventListener("focusout", handleBlur);
      };
    }

    // Для Telegram WebApp подписываемся на события
    if (isTelegram() && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.onEvent("viewportChanged", handleViewportChange);

      return () => {
        tg.offEvent("viewportChanged", handleViewportChange);
        clearTimeout(resizeTimeout);
        clearTimeout(scrollTimeoutRef.current);
      };
    }

    return () => {
      clearTimeout(resizeTimeout);
      clearTimeout(scrollTimeoutRef.current);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleViewportChange,
        );
      }
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [enableScrollIntoView, isAndroid, isTelegram]);

  // Функция для принудительной прокрутки к элементу
  const scrollToInput = useCallback(() => {
    if (!inputRef.current) return;

    const element = inputRef.current;
    const rect = element.getBoundingClientRect();
    const isInView = rect.bottom <= window.innerHeight && rect.top >= 0;

    if (!isInView) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  // Установка правильной высоты для контейнера
  const getContainerStyle = useCallback(() => {
    if (isKeyboardVisible && keyboardHeight > 0) {
      return {
        paddingBottom: `${Math.max(keyboardHeight + 100, 350)}px`,
        transition: "padding-bottom 0.3s ease",
      };
    }

    return {
      paddingBottom: `240px`,
      transition: "padding-bottom 0.3s ease",
    };
  }, [isKeyboardVisible, keyboardHeight]);

  // Стиль для фиксированного элемента внизу экрана
  const getFixedBottomStyle = useCallback(() => {
    if (isKeyboardVisible && keyboardHeight > 0) {
      // Для iOS используем transform вместо bottom для лучшей производительности
      if (isIOS()) {
        return {
          transform: `translateY(-${keyboardHeight}px)`,
          transition: "transform 0.3s ease",
        };
      }

      // Для Android используем bottom
      return {
        bottom: `${keyboardHeight}px`,
        transition: "bottom 0.3s ease",
      };
    }

    return {
      bottom: 0,
      transform: "translateY(0)",
      transition: "bottom 0.3s ease, transform 0.3s ease",
    };
  }, [isKeyboardVisible, keyboardHeight, isIOS]);

  return {
    inputRef,
    keyboardHeight,
    isKeyboardVisible,
    scrollToInput,
    getContainerStyle,
    getFixedBottomStyle,
    isIOS: isIOS(),
    isAndroid: isAndroid(),
  };
};
