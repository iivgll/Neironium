'use client';
import React, { useContext, useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  VStack,
  HStack,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { SidebarContext } from '@/contexts/SidebarContext';
import Image from 'next/image';
import ChatSearchModal from '../modals/ChatSearchModal';
import ChatActionsModal from '../modals/ChatActionsModal';
import NewProjectModal from '../modals/NewProjectModal';
import DeleteChatModal from '../modals/DeleteChatModal';
import RenameChatModal from '../modals/RenameChatModal';
import { Chat } from '@/types/chat';
import { useChats } from '@/hooks/useChats';
import { useProjects } from '@/hooks/useProjects';
import { useSidebarState } from '@/hooks/useSidebarState';
import { ArrowIcon } from '../icons/ArrowIcon';
import { useAssetPath } from '@/hooks/useAssetPath';
import { ActionButton } from './ActionButton';
import { ChatItem } from './ChatItem';


export default function NeuroniumSidebar( ) {
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);
  const { getAssetPath } = useAssetPath();

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
    isOpen: isNewProjectOpen,
    onOpen: onNewProjectOpen,
    onClose: onNewProjectClose,
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

  // Consolidated UI state management
  const {
    hoveredChatId,
    hoveredProjectId,
    actionsModalPosition,
    selectedChatId,
    chatToDelete,
    chatToRename,
    chatToMoveToNewProject,
    editingChatId,
    editingChatTitle,
    setHoveredChatId,
    setHoveredProjectId,
    setActionsModalPosition,
    setSelectedChatId,
    setChatToDelete,
    setChatToRename,
    setChatToMoveToNewProject,
    setEditingChat,
  } = useSidebarState();

  // Custom hooks for state management
  const { chatsList, deleteChat, setActiveChat, getChat, updateChat } =
    useChats();
  const {
    projects,
    createProject,
    toggleProjectExpansion,
    addChatToProject,
    removeChatFromAllProjects,
    setActiveChatInProjects,
    updateChatInProjects,
  } = useProjects();

  const sidebarWidth = isCollapsed ? '68px' : '300px';

  // Memoized event handlers for better performance
  const handleDeleteChat = useCallback(
    (chatId: string) => {
      deleteChat(chatId);
      removeChatFromAllProjects(chatId);
    },
    [deleteChat, removeChatFromAllProjects],
  );

  const handleMoveToProject = useCallback(
    (chatId: string, projectId: string) => {
      const chat = getChat(chatId);
      if (!chat) return;

      // Remove from regular chats and add to project
      deleteChat(chatId);
      addChatToProject(projectId, chat);
    },
    [getChat, deleteChat, addChatToProject],
  );

  const handleChatClick = useCallback(
    (chatId: string) => {
      setActiveChat(chatId);
      setActiveChatInProjects(chatId);
    },
    [setActiveChat, setActiveChatInProjects],
  );

  const handleRenameChat = useCallback(
    (chatId: string, newTitle: string) => {
      updateChat(chatId, { title: newTitle });
      updateChatInProjects(chatId, { title: newTitle });
    },
    [updateChat, updateChatInProjects],
  );

  const startEditingChat = useCallback(
    (chatId: string, currentTitle: string) => {
      setEditingChat(chatId, currentTitle);
    },
    [setEditingChat],
  );

  const cancelEditingChat = useCallback(() => {
    setEditingChat(null, '');
  }, [setEditingChat]);

  const saveEditingChat = useCallback(() => {
    if (editingChatId && editingChatTitle.trim()) {
      handleRenameChat(editingChatId, editingChatTitle.trim());
      setEditingChat(null, '');
    }
  }, [editingChatId, editingChatTitle, handleRenameChat, setEditingChat]);

  const updateEditingChatTitle = useCallback(
    (newTitle: string) => {
      setEditingChat(editingChatId, newTitle);
    },
    [editingChatId, setEditingChat],
  );

  // Optimized chat lookup with Map for O(1) performance
  const chatMap = useMemo(() => {
    const map = new Map();

    // Add regular chats
    chatsList.forEach((chat) => map.set(chat.id, { ...chat, source: 'chats' }));

    // Add project chats
    projects.forEach((project) => {
      project.chats.forEach((chat) =>
        map.set(chat.id, { ...chat, source: 'project', projectId: project.id }),
      );
    });

    return map;
  }, [chatsList, projects]);

  const findChatAnywhere = useCallback(
    (chatId: string) => {
      return chatMap.get(chatId) || null;
    },
    [chatMap],
  );

  // Memoized theme colors
  const theme = useMemo(
    () => ({
      bgColor: '#1e1e1e',
      borderColor: '#343434',
      textPrimary: '#ffffff',
      textSecondary: '#8a8b8c',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
      activeBg: 'rgba(255, 255, 255, 0.1)',
    }),
    [],
  );

  return (
    <Box
      display={{ base: 'none', lg: 'block' }}
      position="fixed"
      left="0"
      top="0"
      h={isCollapsed ? '60px' : '100vh'}
      w={sidebarWidth}
      bg={isCollapsed ? 'transparent' : theme.bgColor}
      borderRight={isCollapsed ? 'none' : '1px solid'}
      borderColor={theme.borderColor}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      zIndex={100}
      boxShadow={isCollapsed ? 'none' : '11px 7px 40px 0px rgba(0,0,0,0.2)'}
    >
      <Flex
        direction="column"
        h="100%"
        p={isCollapsed ? '12px' : '20px'}
        justify={isCollapsed ? 'center' : 'flex-start'}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          mb={isCollapsed ? '0' : '20px'}
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
                  onClick={() => {
                    // Здесь можно добавить логику создания нового чата
                    console.log('Create new chat');
                  }}
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
              theme={theme}
            />
            <ActionButton
              icon="/icons/magnifer.svg"
              iconAlt="Search"
              label="Поиск в чатах"
              onClick={onSearchModalOpen}
              theme={theme}
            />
          </VStack>
        )}

        {/* Main Content Section */}
        {!isCollapsed && (
          <Box flex="1" overflowY="auto">
            {/* Projects Section - показываем первыми если есть проекты */}
            {projects.length > 0 && (
              <>
                <Text
                  fontSize="12px"
                  fontWeight="400"
                  color={theme.textSecondary}
                  textTransform="uppercase"
                  letterSpacing="0.4px"
                  mb="16px"
                >
                  ПРОЕКТЫ
                </Text>
                <VStack spacing="8px" align="stretch" mb="24px">
                  {projects.map((project) => (
                    <VStack key={project.id} spacing="4px" align="stretch">
                      {/* Project Header */}
                      <Flex
                        h="40px"
                        px="10px"
                        py="7px"
                        align="center"
                        cursor="pointer"
                        _hover={{ bg: theme.hoverBg }}
                        borderRadius="10px"
                        onMouseEnter={() => setHoveredProjectId(project.id)}
                        onMouseLeave={() => setHoveredProjectId(null)}
                        onClick={() => toggleProjectExpansion(project.id)}
                      >
                        <Image
                          src={getAssetPath("/icons/folder.svg")}
                          alt="Project"
                          width={16}
                          height={16}
                        />
                        <Text
                          fontSize="16px"
                          color={theme.textPrimary}
                          ml="8px"
                          noOfLines={1}
                          flex="1"
                        >
                          {project.name}
                        </Text>
                        {/* Dropdown Arrow - visible on hover or when expanded */}
                        {(hoveredProjectId === project.id ||
                          project.isExpanded) && (
                          <IconButton
                            aria-label={`${project.isExpanded ? 'Свернуть' : 'Развернуть'} проект ${project.name}`}
                            icon={
                              <ArrowIcon
                                direction={project.isExpanded ? 'up' : 'down'}
                                color={theme.textSecondary}
                                w="16px"
                                h="16px"
                              />
                            }
                            size="xs"
                            variant="ghost"
                            minW="20px"
                            h="20px"
                            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProjectExpansion(project.id);
                            }}
                          />
                        )}
                      </Flex>

                      {/* Project Chats - shown when expanded */}
                      {project.isExpanded && project.chats.length > 0 && (
                        <VStack spacing="4px" align="stretch" pl="24px">
                          {project.chats.map((chat) => (
                            <ChatItem
                              key={chat.id}
                              chat={chat}
                              isProjectChat={true}
                              hoveredChatId={hoveredChatId}
                              editingChatId={editingChatId}
                              editingChatTitle={editingChatTitle}
                              theme={theme}
                              onMouseEnter={() => setHoveredChatId(chat.id)}
                              onMouseLeave={() => setHoveredChatId(null)}
                              onClick={() => handleChatClick(chat.id)}
                              onDoubleClick={() =>
                                startEditingChat(chat.id, chat.title)
                              }
                              onEditingTitleChange={updateEditingChatTitle}
                              onEditingSave={saveEditingChat}
                              onEditingCancel={cancelEditingChat}
                              onMoreActionsClick={(e) => {
                                e.stopPropagation();
                                setSelectedChatId(chat.id);
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setActionsModalPosition({
                                  x: rect.left,
                                  y: rect.bottom + 4,
                                });
                                onChatActionsOpen();
                              }}
                            />
                          ))}
                        </VStack>
                      )}
                    </VStack>
                  ))}
                </VStack>
              </>
            )}

            {/* Chats Section - показываем только если есть чаты */}
            {chatsList.length > 0 && (
              <>
                <Text
                  fontSize="12px"
                  fontWeight="400"
                  color={theme.textSecondary}
                  textTransform="uppercase"
                  letterSpacing="0.4px"
                  mb="16px"
                >
                  ЧАТЫ
                </Text>
                <VStack spacing="8px" align="stretch">
                  {chatsList.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      hoveredChatId={hoveredChatId}
                      editingChatId={editingChatId}
                      editingChatTitle={editingChatTitle}
                      theme={theme}
                      onMouseEnter={() => setHoveredChatId(chat.id)}
                      onMouseLeave={() => setHoveredChatId(null)}
                      onClick={() => handleChatClick(chat.id)}
                      onDoubleClick={() =>
                        startEditingChat(chat.id, chat.title)
                      }
                      onEditingTitleChange={updateEditingChatTitle}
                      onEditingSave={saveEditingChat}
                      onEditingCancel={cancelEditingChat}
                      onMoreActionsClick={(e) => {
                        e.stopPropagation();
                        setSelectedChatId(chat.id);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActionsModalPosition({
                          x: rect.left,
                          y: rect.bottom + 4,
                        });
                        onChatActionsOpen();
                      }}
                      onAddToProjectClick={(e) => {
                        e.stopPropagation();
                        console.log('Add to project clicked');
                      }}
                    />
                  ))}
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
        chatTitle={findChatAnywhere(selectedChatId || '')?.title || 'Чат'}
        chatId={selectedChatId || undefined}
        onRename={() => {
          const chat = findChatAnywhere(selectedChatId || '');
          if (chat) {
            setChatToRename({ id: chat.id, title: chat.title });
            onRenameChatOpen();
            onChatActionsClose();
          }
        }}
        onAddToProject={() => console.log('Add to project')}
        onCopy={() => console.log('Copy chat')}
        onNewProject={() => {
          onNewProjectOpen();
          onChatActionsClose();
        }}
        onDeleteConfirm={(chatTitle) => {
          if (selectedChatId) {
            setChatToDelete({ id: selectedChatId, title: chatTitle });
            onDeleteChatOpen();
          }
        }}
        projects={projects}
        onMoveToProject={(chatId, projectId) => {
          handleMoveToProject(chatId, projectId);
          onChatActionsClose();
        }}
        onCreateProjectAndMove={(chatId) => {
          setChatToMoveToNewProject(chatId);
          onNewProjectOpen();
          onChatActionsClose();
        }}
      />
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => {
          setChatToMoveToNewProject(null);
          onNewProjectClose();
        }}
        onCreateProject={(projectName) => {
          let initialChats: Chat[] = [];

          // If we need to move a chat to the new project
          if (chatToMoveToNewProject) {
            const chat = getChat(chatToMoveToNewProject);
            if (chat) {
              initialChats = [chat];
              deleteChat(chatToMoveToNewProject);
            }
            setChatToMoveToNewProject(null);
          }

          createProject(projectName, initialChats);
          console.log('Created project:', projectName);
        }}
      />
      <DeleteChatModal
        isOpen={isDeleteChatOpen}
        onClose={onDeleteChatClose}
        chatTitle={chatToDelete?.title || ''}
        onConfirm={() => {
          if (chatToDelete) {
            console.log('Delete confirmed for:', chatToDelete);
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
        currentName={chatToRename?.title || ''}
        onRename={(newTitle) => {
          if (chatToRename) {
            handleRenameChat(chatToRename.id, newTitle);
            setChatToRename(null);
          }
        }}
      />
    </Box>
  );
}

// Mobile Responsive Sidebar
export function NeuroniumSidebarResponsive() {
  const { getAssetPath } = useAssetPath();
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
    isOpen: isNewProjectOpen,
    onOpen: onNewProjectOpen,
    onClose: onNewProjectClose,
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

  // Consolidated UI state management - same as desktop
  const {
    hoveredChatId,
    hoveredProjectId,
    actionsModalPosition,
    selectedChatId,
    chatToDelete,
    chatToRename,
    chatToMoveToNewProject,
    editingChatId,
    editingChatTitle,
    setHoveredChatId,
    setHoveredProjectId,
    setActionsModalPosition,
    setSelectedChatId,
    setChatToDelete,
    setChatToRename,
    setChatToMoveToNewProject,
    setEditingChat,
  } = useSidebarState();

  // Custom hooks for state management - same as desktop version
  const { chatsList, deleteChat, setActiveChat, getChat, updateChat } =
    useChats();
  const {
    projects,
    createProject,
    toggleProjectExpansion,
    addChatToProject,
    removeChatFromAllProjects,
    setActiveChatInProjects,
    updateChatInProjects,
  } = useProjects();

  // Event handlers - same as desktop version
  const handleDeleteChat = useCallback(
    (chatId: string) => {
      deleteChat(chatId);
      removeChatFromAllProjects(chatId);
    },
    [deleteChat, removeChatFromAllProjects],
  );

  const handleMoveToProject = useCallback(
    (chatId: string, projectId: string) => {
      const chat = getChat(chatId);
      if (!chat) return;

      // Remove from regular chats and add to project
      deleteChat(chatId);
      addChatToProject(projectId, chat);
    },
    [getChat, deleteChat, addChatToProject],
  );

  const handleChatClick = useCallback(
    (chatId: string) => {
      setActiveChat(chatId);
      setActiveChatInProjects(chatId);
    },
    [setActiveChat, setActiveChatInProjects],
  );

  const handleRenameChat = useCallback(
    (chatId: string, newTitle: string) => {
      updateChat(chatId, { title: newTitle });
      updateChatInProjects(chatId, { title: newTitle });
    },
    [updateChat, updateChatInProjects],
  );

  const startEditingChat = useCallback(
    (chatId: string, currentTitle: string) => {
      setEditingChat(chatId, currentTitle);
    },
    [setEditingChat],
  );

  const cancelEditingChat = useCallback(() => {
    setEditingChat(null, '');
  }, [setEditingChat]);

  const saveEditingChat = useCallback(() => {
    if (editingChatId && editingChatTitle.trim()) {
      handleRenameChat(editingChatId, editingChatTitle.trim());
      setEditingChat(null, '');
    }
  }, [editingChatId, editingChatTitle, handleRenameChat, setEditingChat]);

  const updateEditingChatTitle = useCallback(
    (newTitle: string) => {
      setEditingChat(editingChatId, newTitle);
    },
    [editingChatId, setEditingChat],
  );

  // Optimized chat lookup with Map for O(1) performance - same as desktop
  const mobileChatMap = useMemo(() => {
    const map = new Map();

    // Add regular chats
    chatsList.forEach((chat) => map.set(chat.id, { ...chat, source: 'chats' }));

    // Add project chats
    projects.forEach((project) => {
      project.chats.forEach((chat) =>
        map.set(chat.id, { ...chat, source: 'project', projectId: project.id }),
      );
    });

    return map;
  }, [chatsList, projects]);

  const findChatAnywhere = useCallback(
    (chatId: string) => {
      return mobileChatMap.get(chatId) || null;
    },
    [mobileChatMap],
  );

  // Theme colors - same as desktop
  const theme = useMemo(
    () => ({
      bgColor: '#1e1e1e',
      borderColor: '#343434',
      textPrimary: '#ffffff',
      textSecondary: '#8a8b8c',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
      activeBg: 'rgba(255, 255, 255, 0.1)',
      menuColor: '#ffffff',
    }),
    [],
  );

  return (
    <>
      <Flex display={{ base: 'flex', lg: 'none' }} alignItems="center">
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
          color={theme.menuColor}
          size="md"
        />
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent
          bg={theme.bgColor}
          maxW="300px"
          borderRight="1px solid"
          borderColor={theme.borderColor}
        >
          <DrawerCloseButton
            color={theme.textPrimary}
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
                theme={theme}
              />
              <ActionButton
                icon="/icons/folder-add.svg"
                iconAlt="New project"
                label="Новый проект"
                onClick={onNewProjectOpen}
                theme={theme}
              />
              <ActionButton
                icon="/icons/magnifer.svg"
                iconAlt="Search"
                label="Поиск в чатах"
                onClick={onSearchModalOpen}
                theme={theme}
              />
            </VStack>

            {/* Main Content Section */}
            <Box flex="1" overflowY="auto">
              {/* Projects Section - показываем первыми если есть проекты */}
              {projects.length > 0 && (
                <>
                  <Text
                    fontSize="12px"
                    fontWeight="400"
                    color={theme.textSecondary}
                    textTransform="uppercase"
                    letterSpacing="0.4px"
                    mb="16px"
                  >
                    ПРОЕКТЫ
                  </Text>
                  <VStack spacing="8px" align="stretch" mb="24px">
                    {projects.map((project) => (
                      <VStack key={project.id} spacing="4px" align="stretch">
                        {/* Project Header */}
                        <Flex
                          h="40px"
                          px="10px"
                          py="7px"
                          align="center"
                          cursor="pointer"
                          _hover={{ bg: theme.hoverBg }}
                          borderRadius="10px"
                          onMouseEnter={() => setHoveredProjectId(project.id)}
                          onMouseLeave={() => setHoveredProjectId(null)}
                          onClick={() => toggleProjectExpansion(project.id)}
                        >
                          <Image
                            src={getAssetPath("/icons/folder.svg")}
                            alt="Project"
                            width={16}
                            height={16}
                          />
                          <Text
                            fontSize="16px"
                            color={theme.textPrimary}
                            ml="8px"
                            noOfLines={1}
                            flex="1"
                          >
                            {project.name}
                          </Text>
                          {/* Dropdown Arrow */}
                          {(hoveredProjectId === project.id ||
                            project.isExpanded) && (
                            <IconButton
                              aria-label="Toggle project"
                              icon={
                                <Box
                                  as="svg"
                                  width="16px"
                                  height="16px"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  transform={
                                    project.isExpanded
                                      ? 'rotate(180deg)'
                                      : 'rotate(0deg)'
                                  }
                                  transition="transform 0.2s"
                                >
                                  <path
                                    d="M4 6L8 10L12 6"
                                    stroke={theme.textSecondary}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </Box>
                              }
                              size="xs"
                              variant="ghost"
                              minW="20px"
                              h="20px"
                              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProjectExpansion(project.id);
                              }}
                            />
                          )}
                        </Flex>

                        {/* Project Chats - shown when expanded */}
                        {project.isExpanded && project.chats.length > 0 && (
                          <VStack spacing="4px" align="stretch" pl="24px">
                            {project.chats.map((chat) => (
                              <ChatItem
                                key={chat.id}
                                chat={chat}
                                isProjectChat={true}
                                hoveredChatId={hoveredChatId}
                                editingChatId={editingChatId}
                                editingChatTitle={editingChatTitle}
                                theme={theme}
                                onMouseEnter={() => setHoveredChatId(chat.id)}
                                onMouseLeave={() => setHoveredChatId(null)}
                                onClick={() => handleChatClick(chat.id)}
                                onDoubleClick={() =>
                                  startEditingChat(chat.id, chat.title)
                                }
                                onEditingTitleChange={updateEditingChatTitle}
                                onEditingSave={saveEditingChat}
                                onEditingCancel={cancelEditingChat}
                                onMoreActionsClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedChatId(chat.id);
                                  const rect =
                                    e.currentTarget.getBoundingClientRect();
                                  setActionsModalPosition({
                                    x: rect.left,
                                    y: rect.bottom + 4,
                                  });
                                  onChatActionsOpen();
                                }}
                              />
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    ))}
                  </VStack>
                </>
              )}

              {/* Chats Section - показываем только если есть чаты */}
              {chatsList.length > 0 && (
                <>
                  <Text
                    fontSize="12px"
                    fontWeight="400"
                    color={theme.textSecondary}
                    textTransform="uppercase"
                    letterSpacing="0.4px"
                    mb="16px"
                  >
                    ЧАТЫ
                  </Text>
                  <VStack spacing="8px" align="stretch">
                    {chatsList.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        hoveredChatId={hoveredChatId}
                        editingChatId={editingChatId}
                        editingChatTitle={editingChatTitle}
                        theme={theme}
                        onMouseEnter={() => setHoveredChatId(chat.id)}
                        onMouseLeave={() => setHoveredChatId(null)}
                        onClick={() => handleChatClick(chat.id)}
                        onDoubleClick={() =>
                          startEditingChat(chat.id, chat.title)
                        }
                        onEditingTitleChange={updateEditingChatTitle}
                        onEditingSave={saveEditingChat}
                        onEditingCancel={cancelEditingChat}
                        onMoreActionsClick={(e) => {
                          e.stopPropagation();
                          setSelectedChatId(chat.id);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setActionsModalPosition({
                            x: rect.left,
                            y: rect.bottom + 4,
                          });
                          onChatActionsOpen();
                        }}
                        onAddToProjectClick={(e) => {
                          e.stopPropagation();
                          console.log('Add to project clicked');
                        }}
                      />
                    ))}
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
        chatTitle={findChatAnywhere(selectedChatId || '')?.title || 'Чат'}
        chatId={selectedChatId || undefined}
        onRename={() => {
          const chat = findChatAnywhere(selectedChatId || '');
          if (chat) {
            setChatToRename({ id: chat.id, title: chat.title });
            onRenameChatOpen();
            onChatActionsClose();
          }
        }}
        onAddToProject={() => console.log('Add to project')}
        onCopy={() => console.log('Copy chat')}
        onNewProject={() => {
          onNewProjectOpen();
          onChatActionsClose();
        }}
        onDeleteConfirm={(chatTitle) => {
          if (selectedChatId) {
            setChatToDelete({ id: selectedChatId, title: chatTitle });
            onDeleteChatOpen();
          }
        }}
        projects={projects}
        onMoveToProject={(chatId, projectId) => {
          handleMoveToProject(chatId, projectId);
          onChatActionsClose();
        }}
        onCreateProjectAndMove={(chatId) => {
          setChatToMoveToNewProject(chatId);
          onNewProjectOpen();
          onChatActionsClose();
        }}
      />
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => {
          setChatToMoveToNewProject(null);
          onNewProjectClose();
        }}
        onCreateProject={(projectName) => {
          let initialChats: Chat[] = [];

          // If we need to move a chat to the new project
          if (chatToMoveToNewProject) {
            const chat = getChat(chatToMoveToNewProject);
            if (chat) {
              initialChats = [chat];
              deleteChat(chatToMoveToNewProject);
            }
            setChatToMoveToNewProject(null);
          }

          createProject(projectName, initialChats);
          console.log('Created project:', projectName);
        }}
      />
      <DeleteChatModal
        isOpen={isDeleteChatOpen}
        onClose={onDeleteChatClose}
        chatTitle={chatToDelete?.title || ''}
        onConfirm={() => {
          if (chatToDelete) {
            console.log('Delete confirmed for:', chatToDelete);
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
        currentName={chatToRename?.title || ''}
        onRename={(newTitle) => {
          if (chatToRename) {
            handleRenameChat(chatToRename.id, newTitle);
            setChatToRename(null);
          }
        }}
      />
    </>
  );
}
