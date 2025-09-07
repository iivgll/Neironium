"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { apiClient } from "@/utils/apiClient";
import { UserRead } from "@/types/api";
import { useTelegram } from "./TelegramContext";

interface AuthContextType {
  user: UserRead | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: telegramUser, isTelegramEnvironment } = useTelegram();

  const checkAuthStatus = useCallback(async () => {
    try {
      // Check if we have tokens
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!accessToken || !refreshToken) {
        // No tokens, try to authenticate with Telegram if possible
        if (telegramUser && isTelegramEnvironment) {
          await login();
        }
        return;
      }

      // We have tokens, try to get current user
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth check failed:", error);
      // If getCurrentUser fails and we have Telegram data, try to authenticate
      if (telegramUser && isTelegramEnvironment) {
        try {
          await login();
        } catch (loginError) {
          console.error("Telegram login also failed:", loginError);
        }
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramUser, isTelegramEnvironment]);

  const login = useCallback(async () => {
    if (!telegramUser || !isTelegramEnvironment) {
      setError("Telegram authentication required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare auth payload from Telegram data
      const authPayload = {
        id: telegramUser.id,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        username: telegramUser.username || null,
        photo_url: telegramUser.photo_url || null,
        auth_date: Math.floor(Date.now() / 1000), // Current timestamp
        hash: "mock_hash", // In real app this should be valid hash from Telegram
      };

      await apiClient.loginWithTelegram(authPayload);
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Login failed:", error);
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, [telegramUser, isTelegramEnvironment]);

  useEffect(() => {
    // Only run auth check when Telegram data is ready (or when not in Telegram environment)
    if (telegramUser !== undefined && isTelegramEnvironment !== undefined) {
      checkAuthStatus();
    }
  }, [telegramUser, isTelegramEnvironment, checkAuthStatus]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
