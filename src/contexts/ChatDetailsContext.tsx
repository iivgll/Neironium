"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Chat } from "@/types/chat";

interface ChatDetailsContextType {
  selectedDetailsChat: Chat | null;
  setSelectedDetailsChat: (chat: Chat | null) => void;
}

const ChatDetailsContext = createContext<ChatDetailsContextType | null>(null);

export function ChatDetailsProvider({ children }: { children: ReactNode }) {
  const [selectedDetailsChat, setSelectedDetailsChat] = useState<Chat | null>(null);

  return (
    <ChatDetailsContext.Provider
      value={{
        selectedDetailsChat,
        setSelectedDetailsChat,
      }}
    >
      {children}
    </ChatDetailsContext.Provider>
  );
}

export function useChatDetails(): ChatDetailsContextType {
  const context = useContext(ChatDetailsContext);
  if (!context) {
    throw new Error("useChatDetails must be used within a ChatDetailsProvider");
  }
  return context;
}
