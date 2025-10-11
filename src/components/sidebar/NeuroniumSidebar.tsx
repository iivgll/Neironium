"use client";
import React, { useContext, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  VStack,
  HStack,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { SidebarContext } from "@/contexts/SidebarContext";
import Image from "next/image";
import ChatSearchModal from "../modals/ChatSearchModal";
import ChatActionsModal from "../modals/ChatActionsModal";
import NewChatModal from "../modals/NewChatModal";
import DeleteChatModal from "../modals/DeleteChatModal";
import RenameChatModal from "../modals/RenameChatModal";
import MoveToChatModal from "../modals/MoveToChatModal";
import ChatDetailsModal from "../modals/ChatDetailsModal";
import { Chat } from "@/types/chat";
import { useChats } from "@/hooks/useChats";
import { useChatsContext } from "@/contexts/ChatsContext";
import { useChatDetails } from "@/contexts/ChatDetailsContext";
import { useSidebarState } from "@/hooks/useSidebarState";
import { ArrowIcon } from "../icons/ArrowIcon";
import { useAssetPath } from "@/hooks/useAssetPath";
import { ActionButton } from "./ActionButton";
import { ChatItem } from "./ChatItem";
import { useRouter } from "next/navigation";

export default function NeuroniumSidebar() {
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);
  const { getAssetPath } = useAssetPath();
  const router = useRouter();

  // Modal states
  const {
    isOpen: isSearchModalOpen,
    onOpen: onSearchModalOpen,
    onClose: onSearchModalClose,
  } = useDisclosure();
  const {
    isOpen: isChatActionsOpen,
    onOpen: onChatActionsOpen,
    onClose: onChatActionsClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteChatOpen,
    onOpen: onDeleteChatOpen,
    onClose: onDeleteChatClose,
  } = useDisclosure();
  const {
    isOpen: isRenameChatOpen,
    onOpen: onRenameChatOpen,
    onClose: onRenameChatClose,
  } = useDisclosure();
  const {
    isOpen: isNewChatOpen,
    onOpen: onNewChatOpen,
    onClose: onNewChatClose,
  } = useDisclosure();
  const {
    isOpen: isMoveToChatOpen,
    onOpen: onMoveToChatOpen,
    onClose: onMoveToChatClose,
  } = useDisclosure();
  const {
    isOpen: isChatDetailsOpen,
    onOpen: onChatDetailsOpen,
    onClose: onChatDetailsClose,
  } = useDisclosure();

  // Parent chat state for creating subchat
  const [parentChatForNew, setParentChatForNew] = React.useState<{
    id: number;
    title: string;
  } | null>(null);
  const [chatToMove, setChatToMove] = React.useState<{
    id: number;
    title: string;
  } | null>(null);
  const [detailsChat, setDetailsChat] = React.useState<Chat | null>(null);

  // Consolidated UI state management
  const {
    hoveredChatId,
    actionsModalPosition,
    selectedChatId,
    chatToDelete,
    chatToRename,
    editingChatId,
    editingChatTitle,
    setHoveredChatId,
    setActionsModalPosition,
    setSelectedChatId,
    setChatToDelete,
    setChatToRename,
    setEditingChat,
  } = useSidebarState();

  // Custom hooks for state management
  const { chatsList, deleteChat, setActiveChat, getChat, updateChat } =
    useChats();
  const { chatsTree, activeChatId } = useChatsContext();
  const { setSelectedDetailsChat } = useChatDetails();

  // Local state for chat tree expansion
  const [expandedChats, setExpandedChats] = React.useState<Set<number>>(
    new Set(),
  );

  const toggleChatExpansion = React.useCallback((chatId: number) => {
    setExpandedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  }, []);

  const sidebarWidth = isCollapsed ? "68px" : "300px";

  // Memoized event handlers for better performance
  const handleDeleteChat = useCallback(
    (chatId: number) => {
      deleteChat(chatId);
    },
    [deleteChat],
  );

  const handleChatClick = useCallback(
    (chatId: number) => {
      setActiveChat(chatId);
    },
    [setActiveChat],
  );

  const handleRenameChat = useCallback(
    (chatId: number, newTitle: string) => {
      updateChat(chatId, { title: newTitle });
    },
    [updateChat],
  );

  const startEditingChat = useCallback(
    (chatId: number, currentTitle: string) => {
      setEditingChat(chatId, currentTitle);
    },
    [setEditingChat],
  );

  const cancelEditingChat = useCallback(() => {
    setEditingChat(null, "");
  }, [setEditingChat]);

  const saveEditingChat = useCallback(() => {
    if (editingChatId && editingChatTitle.trim()) {
      handleRenameChat(editingChatId, editingChatTitle.trim());
      setEditingChat(null, "");
    }
  }, [editingChatId, editingChatTitle, handleRenameChat, setEditingChat]);

  const updateEditingChatTitle = useCallback(
    (newTitle: string) => {
      setEditingChat(editingChatId, newTitle);
    },
    [editingChatId, setEditingChat],
  );

  // Memoized theme colors
  const theme = useMemo(
    () => ({
      bgColor: "#1e1e1e",
      borderColor: "#343434",
      textPrimary: "#ffffff",
      textSecondary: "#8a8b8c",
      hoverBg: "rgba(255, 255, 255, 0.05)",
      activeBg: "rgba(255, 255, 255, 0.1)",
    }),
    [],
  );

  // Recursive function to render chat tree
  const renderChatTree = useCallback(
    (chats: Chat[], level: number = 0) => {
      return chats.map((chat) => {
        const isExpanded = expandedChats.has(chat.id);
        const hasChildren = chat.children && chat.children.length > 0;

        return (
          <VStack key={chat.id} spacing="4px" align="stretch">
            <ChatItem
              chat={{
                id: chat.id,
                title: chat.title || "Untitled Chat",
                isActive: activeChatId === chat.id,
                parent_id: chat.parent_id,
                model: chat.model,
                temperature: chat.temperature,
                created_at: chat.created_at,
                updated_at: chat.updated_at,
              }}
              hoveredChatId={hoveredChatId}
              editingChatId={editingChatId}
              editingChatTitle={editingChatTitle}
              theme={theme}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => setHoveredChatId(null)}
              onClick={() => handleChatClick(chat.id)}
              onDoubleClick={() =>
                startEditingChat(chat.id, chat.title || "")
              }
              onEditingTitleChange={updateEditingChatTitle}
              onEditingSave={saveEditingChat}
              onEditingCancel={cancelEditingChat}
              onMoreActionsClick={(e) => {
                e.preventDefault();
                setSelectedChatId(chat.id);
                const rect = e.currentTarget.getBoundingClientRect();
                setActionsModalPosition({
                  x: rect.right + 4,
                  y: rect.top,
                });
                onChatActionsOpen();
              }}
              onPlusClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // Find root parent chat
                const findRootParent = (chatToCheck: Chat): Chat => {
                  if (!chatToCheck.parent_id) return chatToCheck;

                  const findInTree = (chats: Chat[]): Chat | null => {
                    for (const c of chats) {
                      if (c.id === chatToCheck.parent_id) {
                        return findRootParent(c);
                      }
                      if (c.children && c.children.length > 0) {
                        const found = findInTree(c.children);
                        if (found) return found;
                      }
                    }
                    return null;
                  };

                  return findInTree(chatsTree) || chatToCheck;
                };

                const rootChat = findRootParent(chat);
                setSelectedDetailsChat(rootChat);
                setActiveChat(null); // Clear active chat to show ChatTreeView
              }}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
              onToggleExpand={
                hasChildren
                  ? () => toggleChatExpansion(chat.id)
                  : undefined
              }
              level={level}
            />

            {/* Render children if expanded */}
            {isExpanded && hasChildren && (
              <>{renderChatTree(chat.children!, level + 1)}</>
            )}
          </VStack>
        );
      });
    },
    [
      expandedChats,
      hoveredChatId,
      editingChatId,
      editingChatTitle,
      activeChatId,
      handleChatClick,
      startEditingChat,
      updateEditingChatTitle,
      saveEditingChat,
      cancelEditingChat,
      setHoveredChatId,
      setSelectedChatId,
      setActionsModalPosition,
      onChatActionsOpen,
      toggleChatExpansion,
      theme,
      chatsTree,
      setActiveChat,
      setSelectedDetailsChat,
    ],
  );

  return (
    <Box
      display={{ base: "none", lg: "block" }}
      position="fixed"
      left="0"
      top="0"
      h={isCollapsed ? "60px" : "100vh"}
      w={sidebarWidth}
      bg={isCollapsed ? "transparent" : theme.bgColor}
      borderRight={isCollapsed ? "none" : "1px solid"}
      borderColor={theme.borderColor}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      zIndex={100}
      boxShadow={isCollapsed ? "none" : "11px 7px 40px 0px rgba(0,0,0,0.2)"}
    >
      <Flex
        direction="column"
        h="100%"
        p={isCollapsed ? "12px" : "20px"}
        justify={isCollapsed ? "center" : "flex-start"}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          mb={isCollapsed ? "0" : "20px"}
          minH="36px"
        >
          {!isCollapsed ? (
            <>
              <Flex align="center">
                <Box
                  w="36px"
                  h="36px"
                  borderRadius="4px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mr="12px"
                >
                  <Text
                    fontSize="24px"
                    fontWeight="bold"
                    color="white"
                    fontFamily="'Gantari', sans-serif"
                  >
                    Nr
                  </Text>
                </Box>
              </Flex>
              <IconButton
                aria-label="Collapse sidebar"
                icon={
                  <Image
                    src={getAssetPath("/icons/button.svg")}
                    alt="Close sidebar"
                    width={24}
                    height={24}
                  />
                }
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed?.(!isCollapsed)}
                color={theme.textPrimary}
                _hover={{ bg: theme.hoverBg }}
              />
            </>
          ) : (
            <HStack spacing="8px" justify="center">
              <Tooltip label="Развернуть меню" placement="right">
                <IconButton
                  aria-label="Expand sidebar"
                  icon={
                    <Image
                      src={getAssetPath("/icons/cancel_button.svg")}
                      alt="Open sidebar"
                      width={40}
                      height={40}
                    />
                  }
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsCollapsed?.(!isCollapsed)}
                  color={theme.textPrimary}
                  _hover={{ bg: theme.hoverBg }}
                  borderRadius="8px"
                  boxShadow="2px 2px 8px rgba(0,0,0,0.1)"
                />
              </Tooltip>

              <Tooltip label="Создать новый чат" placement="right">
                <IconButton
                  aria-label="New chat"
                  icon={
                    <Image
                      src={getAssetPath("/icons/edit.svg")}
                      alt="New chat"
                      width={22}
                      height={22}
                    />
                  }
                  size="sm"
                  variant="ghost"
                  onClick={onNewChatOpen}
                  color={theme.textPrimary}
                  _hover={{ bg: theme.hoverBg }}
                  borderRadius="8px"
                  boxShadow="2px 2px 8px rgba(0,0,0,0.1)"
                />
              </Tooltip>
            </HStack>
          )}
        </Flex>

        {/* Action Buttons - скрыть в collapsed состоянии */}
        {!isCollapsed && (
          <VStack spacing="8px" mb="24px">
            <ActionButton
              icon="/icons/edit.svg"
              iconAlt="New chat"
              label="Новый чат"
              onClick={onNewChatOpen}
              theme={theme}
            />
            <ActionButton
              icon="/icons/magnifer.svg"
              iconAlt="Search"
              label="Поиск в чатах"
              onClick={onSearchModalOpen}
              theme={theme}
            />
            {/* Telegram Debug */}
            <ActionButton
              icon="/icons/pin.svg"
              iconAlt="Telegram Debug"
              label="Telegram Debug"
              onClick={() => router.push("/telegram-debug")}
              theme={theme}
            />
          </VStack>
        )}

        {/* Main Content Section */}
        {!isCollapsed && (
          <Box
            flex="1"
            overflowY="auto"
            overflowX="auto"
            css={{
              "&::-webkit-scrollbar": {
                width: "4px",
                height: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            {/* Chats Tree Section */}
            {chatsTree.length > 0 && (
              <>
                <Text
                  fontSize="12px"
                  fontWeight="400"
                  color={theme.textSecondary}
                  textTransform="uppercase"
                  letterSpacing="0.4px"
                  mb="16px"
                  flexShrink={0}
                >
                  ЧАТЫ
                </Text>
                <VStack spacing="8px" align="stretch" minW="100%" w="max-content">
                  {renderChatTree(chatsTree)}
                </VStack>
              </>
            )}
          </Box>
        )}
      </Flex>

      {/* Modals */}
      <ChatSearchModal
        isOpen={isSearchModalOpen}
        onClose={onSearchModalClose}
      />
      <ChatActionsModal
        isOpen={isChatActionsOpen}
        onClose={onChatActionsClose}
        position={actionsModalPosition}
        chatTitle={
          chatsList.find((c) => c.id === selectedChatId)?.title || "Чат"
        }
        chatId={selectedChatId || undefined}
        onRename={() => {
          const chat = chatsList.find((c) => c.id === selectedChatId);
          if (chat) {
            setChatToRename({ id: chat.id, title: chat.title || "" });
            onRenameChatOpen();
            onChatActionsClose();
          }
        }}
        onCopy={() => console.log("Copy chat")}
        onCreateSubchat={() => {
          const chat = chatsList.find((c) => c.id === selectedChatId);
          if (chat) {
            setParentChatForNew({ id: chat.id, title: chat.title || "Чат" });
            onNewChatOpen();
            onChatActionsClose();
          }
        }}
        onMoveToChat={() => {
          const chat = chatsList.find((c) => c.id === selectedChatId);
          if (chat) {
            setChatToMove({ id: chat.id, title: chat.title || "Чат" });
            onMoveToChatOpen();
            onChatActionsClose();
          }
        }}
        onDeleteConfirm={(chatTitle) => {
          if (selectedChatId) {
            setChatToDelete({ id: selectedChatId, title: chatTitle });
            onDeleteChatOpen();
          }
        }}
      />
      <DeleteChatModal
        isOpen={isDeleteChatOpen}
        onClose={onDeleteChatClose}
        chatTitle={chatToDelete?.title || ""}
        onConfirm={() => {
          if (chatToDelete) {
            console.log("Delete confirmed for:", chatToDelete);
            handleDeleteChat(chatToDelete.id);
            setChatToDelete(null);
          }
        }}
      />
      <RenameChatModal
        isOpen={isRenameChatOpen}
        onClose={() => {
          setChatToRename(null);
          onRenameChatClose();
        }}
        currentName={chatToRename?.title || ""}
        onRename={(newTitle) => {
          if (chatToRename) {
            handleRenameChat(chatToRename.id, newTitle);
            setChatToRename(null);
          }
        }}
      />
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => {
          setParentChatForNew(null);
          onNewChatClose();
        }}
        parentChatId={parentChatForNew?.id}
        parentChatTitle={parentChatForNew?.title}
      />
      <MoveToChatModal
        isOpen={isMoveToChatOpen}
        onClose={() => {
          setChatToMove(null);
          onMoveToChatClose();
        }}
        currentChatId={chatToMove?.id || 0}
        currentChatTitle={chatToMove?.title || ""}
        allChats={chatsTree}
        onMove={(targetChatId) => {
          if (chatToMove) {
            updateChat(chatToMove.id, { parent_id: targetChatId });
            setChatToMove(null);
          }
        }}
      />
      <ChatDetailsModal
        isOpen={isChatDetailsOpen}
        onClose={() => {
          setDetailsChat(null);
          onChatDetailsClose();
        }}
        chat={detailsChat}
        onRename={() => {
          if (detailsChat) {
            setChatToRename({ id: detailsChat.id, title: detailsChat.title || "" });
            onRenameChatOpen();
          }
        }}
        onMove={() => {
          if (detailsChat) {
            setChatToMove({ id: detailsChat.id, title: detailsChat.title || "Чат" });
            onMoveToChatOpen();
          }
        }}
        onDelete={() => {
          if (detailsChat) {
            setChatToDelete({ id: detailsChat.id, title: detailsChat.title || "" });
            onDeleteChatOpen();
          }
        }}
        onCreateSubchat={() => {
          if (detailsChat) {
            setParentChatForNew({ id: detailsChat.id, title: detailsChat.title || "Чат" });
            onNewChatOpen();
          }
        }}
        onCopy={() => {
          console.log("Copy chat:", detailsChat?.id);
        }}
        onChildChatClick={(chatId) => {
          setActiveChat(chatId);
        }}
      />
    </Box>
  );
}

// Mobile Responsive Sidebar
export function NeuroniumSidebarResponsive() {
  const { getAssetPath } = useAssetPath();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSearchModalOpen,
    onOpen: onSearchModalOpen,
    onClose: onSearchModalClose,
  } = useDisclosure();
  const {
    isOpen: isChatActionsOpen,
    onOpen: onChatActionsOpen,
    onClose: onChatActionsClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteChatOpen,
    onOpen: onDeleteChatOpen,
    onClose: onDeleteChatClose,
  } = useDisclosure();
  const {
    isOpen: isRenameChatOpen,
    onOpen: onRenameChatOpen,
    onClose: onRenameChatClose,
  } = useDisclosure();
  const {
    isOpen: isMobileNewChatOpen,
    onOpen: onMobileNewChatOpen,
    onClose: onMobileNewChatClose,
  } = useDisclosure();
  const {
    isOpen: isMobileMoveToChatOpen,
    onOpen: onMobileMoveToChatOpen,
    onClose: onMobileMoveToChatClose,
  } = useDisclosure();
  const {
    isOpen: isMobileChatDetailsOpen,
    onOpen: onMobileChatDetailsOpen,
    onClose: onMobileChatDetailsClose,
  } = useDisclosure();

  // Parent chat state for creating subchat
  const [mobileParentChatForNew, setMobileParentChatForNew] = React.useState<{
    id: number;
    title: string;
  } | null>(null);
  const [mobileChatToMove, setMobileChatToMove] = React.useState<{
    id: number;
    title: string;
  } | null>(null);
  const [mobileDetailsChat, setMobileDetailsChat] = React.useState<Chat | null>(null);

  // Consolidated UI state management - same as desktop
  const {
    hoveredChatId,
    actionsModalPosition,
    selectedChatId,
    chatToDelete,
    chatToRename,
    editingChatId,
    editingChatTitle,
    setHoveredChatId,
    setActionsModalPosition,
    setSelectedChatId,
    setChatToDelete,
    setChatToRename,
    setEditingChat,
  } = useSidebarState();

  // Custom hooks for state management - same as desktop version
  const { chatsList, deleteChat, setActiveChat, getChat, updateChat } =
    useChats();
  const { chatsTree, activeChatId } = useChatsContext();
  const { setSelectedDetailsChat: setMobileSelectedDetailsChat } = useChatDetails();

  // Local state for chat tree expansion - same as desktop version
  const [mobileExpandedChats, setMobileExpandedChats] = React.useState<
    Set<number>
  >(new Set());

  const mobileToggleChatExpansion = React.useCallback((chatId: number) => {
    setMobileExpandedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  }, []);

  // Event handlers - same as desktop version
  const handleDeleteChat = useCallback(
    (chatId: number) => {
      deleteChat(chatId);
    },
    [deleteChat],
  );

  const handleChatClick = useCallback(
    (chatId: number) => {
      setActiveChat(chatId);
    },
    [setActiveChat],
  );

  const handleRenameChat = useCallback(
    (chatId: number, newTitle: string) => {
      updateChat(chatId, { title: newTitle });
    },
    [updateChat],
  );

  const startEditingChat = useCallback(
    (chatId: number, currentTitle: string) => {
      setEditingChat(chatId, currentTitle);
    },
    [setEditingChat],
  );

  const cancelEditingChat = useCallback(() => {
    setEditingChat(null, "");
  }, [setEditingChat]);

  const saveEditingChat = useCallback(() => {
    if (editingChatId && editingChatTitle.trim()) {
      handleRenameChat(editingChatId, editingChatTitle.trim());
      setEditingChat(null, "");
    }
  }, [editingChatId, editingChatTitle, handleRenameChat, setEditingChat]);

  const updateEditingChatTitle = useCallback(
    (newTitle: string) => {
      setEditingChat(editingChatId, newTitle);
    },
    [editingChatId, setEditingChat],
  );

  // Mobile theme colors
  const mobileTheme = useMemo(
    () => ({
      bgColor: "#1e1e1e",
      borderColor: "#343434",
      textPrimary: "#ffffff",
      textSecondary: "#8a8b8c",
      hoverBg: "rgba(255, 255, 255, 0.05)",
      activeBg: "rgba(255, 255, 255, 0.1)",
      menuColor: "#ffffff",
    }),
    [],
  );

  // Recursive function to render chat tree for mobile
  const renderMobileChatTree = useCallback(
    (chats: Chat[], level: number = 0) => {
      return chats.map((chat) => {
        const isExpanded = mobileExpandedChats.has(chat.id);
        const hasChildren = chat.children && chat.children.length > 0;

        return (
          <VStack key={chat.id} spacing="4px" align="stretch">
            <ChatItem
              chat={{
                id: chat.id,
                title: chat.title || "Untitled Chat",
                isActive: activeChatId === chat.id,
                parent_id: chat.parent_id,
                model: chat.model,
                temperature: chat.temperature,
                created_at: chat.created_at,
                updated_at: chat.updated_at,
              }}
              hoveredChatId={hoveredChatId}
              editingChatId={editingChatId}
              editingChatTitle={editingChatTitle}
              theme={mobileTheme}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => setHoveredChatId(null)}
              onClick={() => handleChatClick(chat.id)}
              onDoubleClick={() =>
                startEditingChat(chat.id, chat.title || "")
              }
              onEditingTitleChange={updateEditingChatTitle}
              onEditingSave={saveEditingChat}
              onEditingCancel={cancelEditingChat}
              onMoreActionsClick={(e) => {
                e.preventDefault();
                setSelectedChatId(chat.id);
                const rect = e.currentTarget.getBoundingClientRect();
                setActionsModalPosition({
                  x: rect.right + 4,
                  y: rect.top,
                });
                onChatActionsOpen();
              }}
              onPlusClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // Find root parent chat
                const findRootParent = (chatToCheck: Chat): Chat => {
                  if (!chatToCheck.parent_id) return chatToCheck;

                  const findInTree = (chats: Chat[]): Chat | null => {
                    for (const c of chats) {
                      if (c.id === chatToCheck.parent_id) {
                        return findRootParent(c);
                      }
                      if (c.children && c.children.length > 0) {
                        const found = findInTree(c.children);
                        if (found) return found;
                      }
                    }
                    return null;
                  };

                  return findInTree(chatsTree) || chatToCheck;
                };

                const rootChat = findRootParent(chat);
                setMobileSelectedDetailsChat(rootChat);
                setActiveChat(null); // Clear active chat to show ChatTreeView
                onClose(); // Close sidebar drawer on mobile
              }}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
              onToggleExpand={
                hasChildren
                  ? () => mobileToggleChatExpansion(chat.id)
                  : undefined
              }
              level={level}
            />

            {/* Render children if expanded */}
            {isExpanded && hasChildren && (
              <>{renderMobileChatTree(chat.children!, level + 1)}</>
            )}
          </VStack>
        );
      });
    },
    [
      mobileExpandedChats,
      hoveredChatId,
      editingChatId,
      editingChatTitle,
      activeChatId,
      handleChatClick,
      startEditingChat,
      updateEditingChatTitle,
      saveEditingChat,
      cancelEditingChat,
      setHoveredChatId,
      setSelectedChatId,
      setActionsModalPosition,
      onChatActionsOpen,
      mobileToggleChatExpansion,
      mobileTheme,
      chatsTree,
      onClose,
      setActiveChat,
      setMobileSelectedDetailsChat,
    ],
  );

  return (
    <>
      <Flex display={{ base: "flex", lg: "none" }} alignItems="center">
        <IconButton
          aria-label="Open menu"
          icon={
            <Image
              src={getAssetPath("/icons/cancel_button.svg")}
              alt="Open sidebar"
              width={24}
              height={24}
            />
          }
          onClick={onOpen}
          variant="ghost"
          color={mobileTheme.menuColor}
          size="md"
        />
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent
          bg={mobileTheme.bgColor}
          maxW="300px"
          borderRight="1px solid"
          borderColor={mobileTheme.borderColor}
        >
          <DrawerCloseButton
            color={mobileTheme.textPrimary}
            position="absolute"
            top="20px"
            right="20px"
            as={IconButton}
            icon={
              <Image
                src={getAssetPath("/icons/button.svg")}
                alt="Close sidebar"
                width={24}
                height={24}
              />
            }
          />
          <DrawerBody p="20px">
            {/* Header */}
            <Flex align="center" mb="20px">
              <Box
                w="36px"
                h="36px"
                borderRadius="4px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr="12px"
              >
                <Text
                  fontSize="24px"
                  fontWeight="bold"
                  color="white"
                  fontFamily="'Gantari', sans-serif"
                >
                  Nr
                </Text>
              </Box>
            </Flex>

            {/* Action Buttons */}
            <VStack spacing="8px" mb="24px">
              <ActionButton
                icon="/icons/edit.svg"
                iconAlt="New chat"
                label="Новый чат"
                onClick={onMobileNewChatOpen}
                theme={mobileTheme}
              />
              <ActionButton
                icon="/icons/magnifer.svg"
                iconAlt="Search"
                label="Поиск в чатах"
                onClick={onSearchModalOpen}
                theme={mobileTheme}
              />
              {/* Telegram Debug */}
              <ActionButton
                icon="/icons/pin.svg"
                iconAlt="Telegram Debug"
                label="Telegram Debug"
                onClick={() => router.push("/telegram-debug")}
                theme={mobileTheme}
              />
            </VStack>

            {/* Main Content Section */}
            <Box
              flex="1"
              overflowY="auto"
              overflowX="auto"
              css={{
                "&::-webkit-scrollbar": {
                  width: "4px",
                  height: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "2px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              {/* Chats Tree Section */}
              {chatsTree.length > 0 && (
                <>
                  <Text
                    fontSize="12px"
                    fontWeight="400"
                    color={mobileTheme.textSecondary}
                    textTransform="uppercase"
                    letterSpacing="0.4px"
                    mb="16px"
                    flexShrink={0}
                  >
                    ЧАТЫ
                  </Text>
                  <VStack spacing="8px" align="stretch" minW="100%" w="max-content">
                    {renderMobileChatTree(chatsTree)}
                  </VStack>
                </>
              )}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Modals */}
      <ChatSearchModal
        isOpen={isSearchModalOpen}
        onClose={onSearchModalClose}
      />
      <ChatActionsModal
        isOpen={isChatActionsOpen}
        onClose={onChatActionsClose}
        position={actionsModalPosition}
        chatTitle={
          chatsList.find((c) => c.id === selectedChatId)?.title || "Чат"
        }
        chatId={selectedChatId || undefined}
        onRename={() => {
          const chat = chatsList.find((c) => c.id === selectedChatId);
          if (chat) {
            setChatToRename({ id: chat.id, title: chat.title || "" });
            onRenameChatOpen();
            onChatActionsClose();
          }
        }}
        onCopy={() => console.log("Copy chat")}
        onCreateSubchat={() => {
          const chat = chatsList.find((c) => c.id === selectedChatId);
          if (chat) {
            setMobileParentChatForNew({ id: chat.id, title: chat.title || "Чат" });
            onMobileNewChatOpen();
            onChatActionsClose();
          }
        }}
        onMoveToChat={() => {
          const chat = chatsList.find((c) => c.id === selectedChatId);
          if (chat) {
            setMobileChatToMove({ id: chat.id, title: chat.title || "Чат" });
            onMobileMoveToChatOpen();
            onChatActionsClose();
          }
        }}
        onDeleteConfirm={(chatTitle) => {
          if (selectedChatId) {
            setChatToDelete({ id: selectedChatId, title: chatTitle });
            onDeleteChatOpen();
          }
        }}
      />
      <DeleteChatModal
        isOpen={isDeleteChatOpen}
        onClose={onDeleteChatClose}
        chatTitle={chatToDelete?.title || ""}
        onConfirm={() => {
          if (chatToDelete) {
            console.log("Delete confirmed for:", chatToDelete);
            handleDeleteChat(chatToDelete.id);
            setChatToDelete(null);
          }
        }}
      />
      <RenameChatModal
        isOpen={isRenameChatOpen}
        onClose={() => {
          setChatToRename(null);
          onRenameChatClose();
        }}
        currentName={chatToRename?.title || ""}
        onRename={(newTitle) => {
          if (chatToRename) {
            handleRenameChat(chatToRename.id, newTitle);
            setChatToRename(null);
          }
        }}
      />
      <NewChatModal
        isOpen={isMobileNewChatOpen}
        onClose={() => {
          setMobileParentChatForNew(null);
          onMobileNewChatClose();
        }}
        parentChatId={mobileParentChatForNew?.id}
        parentChatTitle={mobileParentChatForNew?.title}
      />
      <MoveToChatModal
        isOpen={isMobileMoveToChatOpen}
        onClose={() => {
          setMobileChatToMove(null);
          onMobileMoveToChatClose();
        }}
        currentChatId={mobileChatToMove?.id || 0}
        currentChatTitle={mobileChatToMove?.title || ""}
        allChats={chatsTree}
        onMove={(targetChatId) => {
          if (mobileChatToMove) {
            updateChat(mobileChatToMove.id, { parent_id: targetChatId });
            setMobileChatToMove(null);
          }
        }}
      />
      <ChatDetailsModal
        isOpen={isMobileChatDetailsOpen}
        onClose={() => {
          setMobileDetailsChat(null);
          onMobileChatDetailsClose();
        }}
        chat={mobileDetailsChat}
        onRename={() => {
          if (mobileDetailsChat) {
            setChatToRename({ id: mobileDetailsChat.id, title: mobileDetailsChat.title || "" });
            onRenameChatOpen();
          }
        }}
        onMove={() => {
          if (mobileDetailsChat) {
            setMobileChatToMove({ id: mobileDetailsChat.id, title: mobileDetailsChat.title || "Чат" });
            onMobileMoveToChatOpen();
          }
        }}
        onDelete={() => {
          if (mobileDetailsChat) {
            setChatToDelete({ id: mobileDetailsChat.id, title: mobileDetailsChat.title || "" });
            onDeleteChatOpen();
          }
        }}
        onCreateSubchat={() => {
          if (mobileDetailsChat) {
            setMobileParentChatForNew({ id: mobileDetailsChat.id, title: mobileDetailsChat.title || "Чат" });
            onMobileNewChatOpen();
          }
        }}
        onCopy={() => {
          console.log("Copy chat:", mobileDetailsChat?.id);
        }}
        onChildChatClick={(chatId) => {
          setActiveChat(chatId);
        }}
      />
    </>
  );
}
