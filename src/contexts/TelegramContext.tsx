"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { TelegramWebAppUser, MOCK_TELEGRAM_USER } from "@/types/telegram";
import {
  TELEGRAM_SCRIPT_URL,
  AUTH_VALIDITY_DURATION,
  LOADING_DELAYS,
  TELEGRAM_THEME,
} from "@/constants/telegram";

interface TelegramContextType {
  user: TelegramWebAppUser | null;
  isLoading: boolean;
  isTelegramEnvironment: boolean;
  isUnauthorized: boolean;
  displayName: string;
}

const defaultTelegramContext: TelegramContextType = {
  user: null,
  isLoading: true,
  isTelegramEnvironment: false,
  isUnauthorized: false,
  displayName: "Гость",
};

const TelegramContext = createContext<TelegramContextType>(
  defaultTelegramContext,
);

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  // Initialize states
  const [user, setUser] = useState<TelegramWebAppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to match server/client state
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // In development mode, bypass Telegram check automatically
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      if (process.env.NODE_ENV === "development") {
        console.warn("🚨 Development mode: Using mock Telegram data");
        console.log("📱 Mock Platform: web");
        console.log("📐 Mock Viewport Height: 1000");
        console.log("📏 Mock Expanded: true");
      }
      setUser(MOCK_TELEGRAM_USER);
      setIsTelegramEnvironment(true);
      setIsUnauthorized(false);

      setTimeout(() => setIsLoading(false), LOADING_DELAYS.DEVELOPMENT);
      return;
    }

    // Add a small delay to show the loading screen
    const initTimer = setTimeout(() => {
      // Load Telegram script asynchronously if not already loaded
      if (typeof window !== "undefined" && !window.Telegram) {
        const script = document.createElement("script");
        script.src = TELEGRAM_SCRIPT_URL;
        script.async = true;
        script.crossOrigin = "anonymous";
        // Note: Telegram script doesn't provide integrity hash, but we add crossorigin for security
        script.onload = () => {
          checkTelegramEnvironment();
        };
        script.onerror = () => {
          if (process.env.NODE_ENV === "development") {
            console.error("❌ Failed to load Telegram WebApp script");
          }
          setIsUnauthorized(true);
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } else {
        // Check immediately if already loaded
        checkTelegramEnvironment();
      }
    }, LOADING_DELAYS.SCRIPT_LOAD);

    function checkTelegramEnvironment() {
      if (typeof window === "undefined") {
        setIsUnauthorized(true);
        setIsLoading(false);
        return;
      }

      const telegramWebApp = window.Telegram?.WebApp;

      // Strict validation - only allow access from Telegram
      if (
        telegramWebApp &&
        telegramWebApp.initData &&
        telegramWebApp.initDataUnsafe?.auth_date
      ) {
        // Additional validation: check if initData is present and valid
        const hasValidInitData = telegramWebApp.initData.length > 0;
        const hasValidAuthDate =
          telegramWebApp.initDataUnsafe &&
          Date.now() / 1000 - telegramWebApp.initDataUnsafe.auth_date <
            AUTH_VALIDITY_DURATION;

        if (hasValidInitData && hasValidAuthDate) {
          setIsTelegramEnvironment(true);
          setUser(telegramWebApp.initDataUnsafe.user || null);

          // Configure Telegram Web App
          configureTelegramWebApp(telegramWebApp);

          try {
            telegramWebApp.ready();
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.warn("⚠️ Failed to initialize Telegram Web App:", error);
            }
            // Continue anyway as this is not critical
          }

          // Small delay before hiding loading for smoother transition
          setTimeout(() => setIsLoading(false), LOADING_DELAYS.PRODUCTION);
        } else {
          // Invalid or expired auth data
          setIsUnauthorized(true);
          setIsLoading(false);
        }
      } else {
        // Not in Telegram environment - block access
        setIsUnauthorized(true);
        setIsLoading(false);
      }
    }

    function configureTelegramWebApp(webApp: any) {
      try {
        // Expand the Web App to full height (this makes it use maximum available space)
        webApp.expand();

        // Set header color to match app theme
        webApp.setHeaderColor(TELEGRAM_THEME.HEADER_COLOR);

        // Set background color
        webApp.setBackgroundColor(TELEGRAM_THEME.BACKGROUND_COLOR);

        // Enable closing confirmation
        webApp.enableClosingConfirmation();

        // Try to set the optimal viewport height
        // Note: Telegram Web Apps don't have direct width control, but expand() maximizes the available space
        if (webApp.isVersionAtLeast && webApp.isVersionAtLeast("6.0")) {
          // For newer versions, the Web App automatically adjusts to optimal size
          if (process.env.NODE_ENV === "development") {
            console.log(
              "📐 Using automatic viewport optimization for Telegram Web App v6.0+",
            );
          }
        }

        // Listen to viewport changes
        webApp.onEvent("viewportChanged", () => {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "📐 Viewport changed - Height:",
              webApp.viewportHeight,
              "Stable:",
              webApp.viewportStableHeight,
            );
          }
        });

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Telegram Web App configured successfully");
          console.log("📱 Platform:", webApp.platform);
          console.log("📐 Initial Viewport Height:", webApp.viewportHeight);
          console.log(
            "📐 Stable Viewport Height:",
            webApp.viewportStableHeight,
          );
          console.log("📏 Expanded:", webApp.isExpanded);
          console.log("🔍 Version:", webApp.version);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ Failed to configure Telegram Web App:", error);
        }
        // In production, silently fail but don't break the app
      }
    }

    return () => clearTimeout(initTimer);
  }, []);

  // Generate display name based on user data
  const displayName = useMemo(() => {
    if (!user) return "Гость";

    // Try to use first_name + last_name
    if (user.first_name) {
      return user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name;
    }

    // Fallback to username
    if (user.username) {
      return user.username;
    }

    // Final fallback
    return "Гость";
  }, [user]);

  const contextValue: TelegramContextType = useMemo(
    () => ({
      user,
      isLoading,
      isTelegramEnvironment,
      isUnauthorized,
      displayName,
    }),
    [user, isLoading, isTelegramEnvironment, isUnauthorized, displayName],
  );

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextType {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
}
