'use client';
import { useEffect, useCallback, useRef } from 'react';

interface UseIOSKeyboardFixOptions {
  inputRef?: React.RefObject<HTMLElement>;
  containerRef?: React.RefObject<HTMLElement>;
  scrollOffset?: number;
}

export function useIOSKeyboardFix(options: UseIOSKeyboardFixOptions = {}) {
  const { inputRef, containerRef, scrollOffset = 100 } = options;
  const visualViewportSupported = useRef(false);
  const lastScrollPosition = useRef(0);
  const isKeyboardOpen = useRef(false);

  // Detect iOS devices
  const isIOS = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const ua = window.navigator.userAgent;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isIOSSafari = isIOSDevice && /Safari/.test(ua) && !/CriOS/.test(ua);

    // Also check for iOS in Telegram WebApp
    const isTelegramIOS =
      isIOSDevice ||
      (typeof window !== 'undefined' &&
        window.Telegram?.WebApp?.platform === 'ios');

    return isIOSDevice || isIOSSafari || isTelegramIOS;
  }, []);

  // Handle viewport resize for iOS
  const handleViewportChange = useCallback(() => {
    if (!isIOS() || typeof window === 'undefined') return;

    const visualViewport = (window as any).visualViewport;

    if (visualViewport) {
      const hasKeyboard = window.innerHeight > visualViewport.height + 50;

      if (hasKeyboard && !isKeyboardOpen.current) {
        isKeyboardOpen.current = true;

        // Store current scroll position
        lastScrollPosition.current = window.scrollY;

        // Scroll input into view with offset
        if (inputRef?.current) {
          const inputRect = inputRef.current.getBoundingClientRect();
          const viewportHeight = visualViewport.height;
          const inputBottom = inputRect.bottom;

          // If input is below viewport, scroll it into view
          if (inputBottom > viewportHeight - scrollOffset) {
            const scrollAmount = inputBottom - viewportHeight + scrollOffset;

            window.scrollTo({
              top: window.scrollY + scrollAmount,
              behavior: 'smooth',
            });
          }
        }

        // Update container height to prevent overlapping
        if (containerRef?.current) {
          const keyboardHeight = window.innerHeight - visualViewport.height;
          containerRef.current.style.paddingBottom = `${keyboardHeight + 20}px`;
          containerRef.current.style.transition = 'padding-bottom 0.3s ease';
        }
      } else if (!hasKeyboard && isKeyboardOpen.current) {
        isKeyboardOpen.current = false;

        // Reset container padding
        if (containerRef?.current) {
          containerRef.current.style.paddingBottom = '';
        }

        // Restore scroll position
        setTimeout(() => {
          window.scrollTo({
            top: lastScrollPosition.current,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }, [isIOS, inputRef, containerRef, scrollOffset]);

  // Alternative method for older iOS versions
  const handleFocusBlur = useCallback(
    (event: FocusEvent) => {
      if (!isIOS()) return;

      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (event.type === 'focusin' && isInput) {
        // Keyboard is opening
        setTimeout(() => {
          // Scroll element into view
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });

          // Additional scroll adjustment
          const rect = target.getBoundingClientRect();
          const viewportHeight =
            window.visualViewport?.height || window.innerHeight;

          if (rect.bottom > viewportHeight - scrollOffset) {
            window.scrollBy({
              top: rect.bottom - viewportHeight + scrollOffset,
              behavior: 'smooth',
            });
          }
        }, 300);

        // Add extra padding to body
        document.body.style.paddingBottom = '300px';
      } else if (event.type === 'focusout' && isInput) {
        // Keyboard is closing
        setTimeout(() => {
          document.body.style.paddingBottom = '';
          // Scroll to top to reset view
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    },
    [isIOS, scrollOffset],
  );

  // Setup listeners
  useEffect(() => {
    if (!isIOS()) return;

    // Check for VisualViewport API support
    visualViewportSupported.current = 'visualViewport' in window;

    if (visualViewportSupported.current) {
      const visualViewport = (window as any).visualViewport;

      // Listen to viewport changes
      visualViewport?.addEventListener('resize', handleViewportChange);
      visualViewport?.addEventListener('scroll', handleViewportChange);
      window.addEventListener('resize', handleViewportChange);

      // Initial check
      handleViewportChange();
    }

    // Fallback for older iOS versions
    document.addEventListener('focusin', handleFocusBlur);
    document.addEventListener('focusout', handleFocusBlur);

    // Add viewport meta tag adjustments
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const originalContent = viewport.getAttribute('content');
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no',
      );

      return () => {
        if (visualViewportSupported.current) {
          const vv = (window as any).visualViewport;
          vv?.removeEventListener('resize', handleViewportChange);
          vv?.removeEventListener('scroll', handleViewportChange);
          window.removeEventListener('resize', handleViewportChange);
        }

        document.removeEventListener('focusin', handleFocusBlur);
        document.removeEventListener('focusout', handleFocusBlur);

        // Restore original viewport
        if (viewport && originalContent) {
          viewport.setAttribute('content', originalContent);
        }
      };
    }
  }, [isIOS, handleViewportChange, handleFocusBlur]);

  return {
    isIOS: isIOS(),
    isKeyboardOpen: isKeyboardOpen.current,
    handleViewportChange,
  };
}
