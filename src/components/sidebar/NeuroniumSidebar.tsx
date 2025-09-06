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
import NewProjectModal from "../modals/NewProjectModal";
import NewChatModal from "../modals/NewChatModal";
import EditProjectModal from "../modals/EditProjectModal";
import ProjectActionsModal from "../modals/ProjectActionsModal";
import DeleteChatModal from "../modals/DeleteChatModal";
import RenameChatModal from "../modals/RenameChatModal";
import { Chat } from "@/types/chat";
import { useChats } from "@/hooks/useChats";
import { useChatsContext } from "@/contexts/ChatsContext";
import { useProjects } from "@/contexts/ProjectsContext";
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
  const {
    isOpen: isEditProjectOpen,
    onOpen: onEditProjectOpen,
    onClose: onEditProjectClose,
  } = useDisclosure();
  const {
    isOpen: isProjectActionsOpen,
    onOpen: onProjectActionsOpen,
    onClose: onProjectActionsClose,
  } = useDisclosure();
  const {
    isOpen: isNewChatOpen,
    onOpen: onNewChatOpen,
    onClose: onNewChatClose,
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

  // Project-specific state
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    number | null
  >(null);
  const [projectActionsPosition, setProjectActionsPosition] = React.useState({
    x: 0,
    y: 0,
  });
  const [projectToEdit, setProjectToEdit] = React.useState<{
    id: number;
    name: string;
    description?: string;
  } | null>(null);

  // Custom hooks for state management
  const { chatsList, deleteChat, setActiveChat, getChat, updateChat } =
    useChats();
  const { getChatsByProject, getChatsWithoutProject, activeChatId } =
    useChatsContext();
  const {
    projects,
    currentProject,
    isLoading: projectsLoading,
    error: projectsError,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  } = useProjects();

  // Local state for project expansion (since API projects don't have isExpanded)
  const [expandedProjects, setExpandedProjects] = React.useState<Set<number>>(
    new Set(),
  );

  const toggleProjectExpansion = React.useCallback((projectId: number) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
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

  // Project handlers
  const handleProjectEdit = useCallback(() => {
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project) {
      setProjectToEdit({
        id: project.id,
        name: project.name,
        description: project.description || undefined,
      });
      onEditProjectOpen();
    }
  }, [selectedProjectId, projects, onEditProjectOpen]);

  const handleProjectDelete = useCallback(
    async (projectName: string) => {
      if (selectedProjectId) {
        try {
          await deleteProject(selectedProjectId);
          setSelectedProjectId(null);
        } catch (error) {
          console.error("Failed to delete project:", error);
          // TODO: Show error notification
        }
      }
    },
    [selectedProjectId, deleteProject],
  );

  const handleUpdateProject = useCallback(
    async (projectName: string, description?: string) => {
      if (projectToEdit) {
        try {
          await updateProject(projectToEdit.id, {
            name: projectName,
            description: description || undefined,
          });
          setProjectToEdit(null);
        } catch (error) {
          console.error("Failed to update project:", error);
          // TODO: Show error notification
        }
      }
    },
    [projectToEdit, updateProject],
  );

  // Optimized chat lookup with Map for O(1) performance
  const chatMap = useMemo(() => {
    const map = new Map();

    // Add regular chats (chats without project)
    const chatsWithoutProject = getChatsWithoutProject();
    chatsWithoutProject.forEach((chat) =>
      map.set(chat.id, {
        ...chat,
        source: "chats",
        // Convert to legacy Chat format for compatibility
        title: chat.title || "Untitled Chat",
        isActive: activeChatId === chat.id,
      }),
    );

    // Add project chats
    projects.forEach((project) => {
      const projectChats = getChatsByProject(project.id);
      projectChats.forEach((chat) =>
        map.set(chat.id, {
          ...chat,
          source: "projects",
          projectId: project.id,
          // Convert to legacy Chat format for compatibility
          title: chat.title || "Untitled Chat",
          isActive: activeChatId === chat.id,
        }),
      );
    });

    return map;
  }, [getChatsWithoutProject, getChatsByProject, projects, activeChatId]);

  const findChatAnywhere = useCallback(
    (chatId: number) => {
      return chatMap.get(chatId) || null;
    },
    [chatMap],
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
                  {projects.map((project) => {
                    const isExpanded = expandedProjects.has(project.id);
                    return (
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
                          onClick={() => {
                            toggleProjectExpansion(project.id);
                            setCurrentProject(project);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setSelectedProjectId(project.id);
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setProjectActionsPosition({
                              x: rect.right + 4,
                              y: rect.top,
                            });
                            onProjectActionsOpen();
                          }}
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
                          {(hoveredProjectId === project.id || isExpanded) && (
                            <IconButton
                              aria-label={`${isExpanded ? "Свернуть" : "Развернуть"} проект ${project.name}`}
                              icon={
                                <ArrowIcon
                                  direction={isExpanded ? "up" : "down"}
                                  color={theme.textSecondary}
                                  w="16px"
                                  h="16px"
                                />
                              }
                              size="xs"
                              variant="ghost"
                              minW="20px"
                              h="20px"
                              _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProjectExpansion(project.id);
                              }}
                            />
                          )}
                        </Flex>

                        {/* Project Chats - shown when expanded */}
                        {isExpanded && (
                          <VStack spacing="4px" align="stretch" pl="24px">
                            {getChatsByProject(project.id).length === 0 ? (
                              <Text
                                fontSize="12px"
                                color={theme.textSecondary}
                                fontStyle="italic"
                              >
                                Нет чатов в этом проекте
                              </Text>
                            ) : (
                              getChatsByProject(project.id).map((chat) => (
                                <ChatItem
                                  key={chat.id}
                                  chat={{
                                    id: chat.id,
                                    title: chat.title || "Untitled Chat",
                                    isActive: activeChatId === chat.id,
                                    project_id: chat.project_id,
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
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    setActionsModalPosition({
                                      x: rect.right + 4,
                                      y: rect.top,
                                    });
                                    onChatActionsOpen();
                                  }}
                                />
                              ))
                            )}
                          </VStack>
                        )}
                      </VStack>
                    );
                  })}
                </VStack>
              </>
            )}

            {/* Chats Section - показываем только чаты без проекта */}
            {getChatsWithoutProject().length > 0 && (
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
                  {getChatsWithoutProject().map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={{
                        id: chat.id,
                        title: chat.title || "Untitled Chat",
                        isActive: activeChatId === chat.id,
                        project_id: chat.project_id,
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
        chatTitle={
          (selectedChatId ? findChatAnywhere(selectedChatId) : null)?.title ||
          "Чат"
        }
        chatId={selectedChatId || undefined}
        onRename={() => {
          const chat = selectedChatId ? findChatAnywhere(selectedChatId) : null;
          if (chat) {
            setChatToRename({ id: chat.id, title: chat.title || "" });
            onRenameChatOpen();
            onChatActionsClose();
          }
        }}
        onAddToProject={() => console.log("Add to project")}
        onCopy={() => console.log("Copy chat")}
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
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        onMoveToProject={(chatId, projectId) => {
          updateChat(chatId, { project_id: projectId });
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
        onCreateProject={async (projectName) => {
          try {
            await createProject(projectName);
            setChatToMoveToNewProject(null);
            console.log("Created project:", projectName);
          } catch (error) {
            console.error("Failed to create project:", error);
            // TODO: Show error notification to user
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
      <EditProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => {
          setProjectToEdit(null);
          onEditProjectClose();
        }}
        currentName={projectToEdit?.name || ""}
        currentDescription={projectToEdit?.description}
        onUpdateProject={handleUpdateProject}
      />
      <ProjectActionsModal
        isOpen={isProjectActionsOpen}
        onClose={onProjectActionsClose}
        position={projectActionsPosition}
        projectName={
          projects.find((p) => p.id === selectedProjectId)?.name || ""
        }
        projectId={selectedProjectId || 0}
        onEdit={handleProjectEdit}
        onDeleteConfirm={handleProjectDelete}
      />
      <NewChatModal isOpen={isNewChatOpen} onClose={onNewChatClose} />
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
  const {
    isOpen: isEditProjectOpen,
    onOpen: onEditProjectOpen,
    onClose: onEditProjectClose,
  } = useDisclosure();
  const {
    isOpen: isProjectActionsOpen,
    onOpen: onProjectActionsOpen,
    onClose: onProjectActionsClose,
  } = useDisclosure();
  const {
    isOpen: isMobileNewChatOpen,
    onOpen: onMobileNewChatOpen,
    onClose: onMobileNewChatClose,
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

  // Mobile project-specific state - same as desktop
  const [mobileSelectedProjectId, setMobileSelectedProjectId] = React.useState<
    number | null
  >(null);
  const [mobileProjectActionsPosition, setMobileProjectActionsPosition] =
    React.useState({ x: 0, y: 0 });
  const [mobileProjectToEdit, setMobileProjectToEdit] = React.useState<{
    id: number;
    name: string;
    description?: string;
  } | null>(null);

  // Custom hooks for state management - same as desktop version
  const { chatsList, deleteChat, setActiveChat, getChat, updateChat } =
    useChats();
  const { getChatsByProject, getChatsWithoutProject, activeChatId } =
    useChatsContext();
  const {
    projects,
    currentProject,
    isLoading: projectsLoading,
    error: projectsError,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  } = useProjects();

  // Local state for project expansion - same as desktop version
  const [mobileExpandedProjects, setMobileExpandedProjects] = React.useState<
    Set<number>
  >(new Set());

  const mobileToggleProjectExpansion = React.useCallback(
    (projectId: number) => {
      setMobileExpandedProjects((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(projectId)) {
          newSet.delete(projectId);
        } else {
          newSet.add(projectId);
        }
        return newSet;
      });
    },
    [],
  );

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

  // Mobile project handlers - same as desktop
  const mobileHandleProjectEdit = useCallback(() => {
    const project = projects.find((p) => p.id === mobileSelectedProjectId);
    if (project) {
      setMobileProjectToEdit({
        id: project.id,
        name: project.name,
        description: project.description || undefined,
      });
      onEditProjectOpen();
    }
  }, [mobileSelectedProjectId, projects, onEditProjectOpen]);

  const mobileHandleProjectDelete = useCallback(
    async (projectName: string) => {
      if (mobileSelectedProjectId) {
        try {
          await deleteProject(mobileSelectedProjectId);
          setMobileSelectedProjectId(null);
        } catch (error) {
          console.error("Failed to delete project:", error);
          // TODO: Show error notification
        }
      }
    },
    [mobileSelectedProjectId, deleteProject],
  );

  const mobileHandleUpdateProject = useCallback(
    async (projectName: string, description?: string) => {
      if (mobileProjectToEdit) {
        try {
          await updateProject(mobileProjectToEdit.id, {
            name: projectName,
            description: description || undefined,
          });
          setMobileProjectToEdit(null);
        } catch (error) {
          console.error("Failed to update project:", error);
          // TODO: Show error notification
        }
      }
    },
    [mobileProjectToEdit, updateProject],
  );

  // Optimized chat lookup with Map for O(1) performance - same as desktop
  const mobileChatMap = useMemo(() => {
    const map = new Map();

    // Add regular chats (chats without project)
    const chatsWithoutProject = getChatsWithoutProject();
    chatsWithoutProject.forEach((chat) =>
      map.set(chat.id, {
        ...chat,
        source: "chats",
        // Convert to legacy Chat format for compatibility
        title: chat.title || "Untitled Chat",
        isActive: activeChatId === chat.id,
      }),
    );

    // Add project chats
    projects.forEach((project) => {
      const projectChats = getChatsByProject(project.id);
      projectChats.forEach((chat) =>
        map.set(chat.id, {
          ...chat,
          source: "projects",
          projectId: project.id,
          // Convert to legacy Chat format for compatibility
          title: chat.title || "Untitled Chat",
          isActive: activeChatId === chat.id,
        }),
      );
    });

    return map;
  }, [getChatsWithoutProject, getChatsByProject, projects, activeChatId]);

  const findChatAnywhere = useCallback(
    (chatId: number) => {
      return mobileChatMap.get(chatId) || null;
    },
    [mobileChatMap],
  );

  // Theme colors - same as desktop
  const theme = useMemo(
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
                onClick={onMobileNewChatOpen}
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
              {/* Telegram Debug */}
              <ActionButton
                icon="/icons/pin.svg"
                iconAlt="Telegram Debug"
                label="Telegram Debug"
                onClick={() => router.push("/telegram-debug")}
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
                    {projects.map((project) => {
                      const isExpanded = mobileExpandedProjects.has(project.id);
                      return (
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
                            onClick={() => {
                              mobileToggleProjectExpansion(project.id);
                              setCurrentProject(project);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setMobileSelectedProjectId(project.id);
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setMobileProjectActionsPosition({
                                x: rect.right + 4,
                                y: rect.top,
                              });
                              onProjectActionsOpen();
                            }}
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
                              isExpanded) && (
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
                                      isExpanded
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)"
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
                                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mobileToggleProjectExpansion(project.id);
                                }}
                              />
                            )}
                          </Flex>

                          {/* Project Chats - shown when expanded */}
                          {isExpanded && (
                            <VStack spacing="4px" align="stretch" pl="24px">
                              {getChatsByProject(project.id).length === 0 ? (
                                <Text
                                  fontSize="12px"
                                  color={theme.textSecondary}
                                  fontStyle="italic"
                                >
                                  Нет чатов в этом проекте
                                </Text>
                              ) : (
                                getChatsByProject(project.id).map((chat) => (
                                  <ChatItem
                                    key={chat.id}
                                    chat={{
                                      id: chat.id,
                                      title: chat.title || "Untitled Chat",
                                      isActive: activeChatId === chat.id,
                                      project_id: chat.project_id,
                                      model: chat.model,
                                      temperature: chat.temperature,
                                      created_at: chat.created_at,
                                      updated_at: chat.updated_at,
                                    }}
                                    hoveredChatId={hoveredChatId}
                                    editingChatId={editingChatId}
                                    editingChatTitle={editingChatTitle}
                                    theme={theme}
                                    onMouseEnter={() =>
                                      setHoveredChatId(chat.id)
                                    }
                                    onMouseLeave={() => setHoveredChatId(null)}
                                    onClick={() => handleChatClick(chat.id)}
                                    onDoubleClick={() =>
                                      startEditingChat(
                                        chat.id,
                                        chat.title || "",
                                      )
                                    }
                                    onEditingTitleChange={
                                      updateEditingChatTitle
                                    }
                                    onEditingSave={saveEditingChat}
                                    onEditingCancel={cancelEditingChat}
                                    onMoreActionsClick={(e) => {
                                      e.preventDefault();
                                      setSelectedChatId(chat.id);
                                      const rect =
                                        e.currentTarget.getBoundingClientRect();
                                      setActionsModalPosition({
                                        x: rect.right + 4,
                                        y: rect.top,
                                      });
                                      onChatActionsOpen();
                                    }}
                                  />
                                ))
                              )}
                            </VStack>
                          )}
                        </VStack>
                      );
                    })}
                  </VStack>
                </>
              )}

              {/* Chats Section - показываем только чаты без проекта */}
              {getChatsWithoutProject().length > 0 && (
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
                    {getChatsWithoutProject().map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={{
                          id: chat.id,
                          title: chat.title || "Untitled Chat",
                          isActive: activeChatId === chat.id,
                          project_id: chat.project_id,
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
        chatTitle={
          (selectedChatId ? findChatAnywhere(selectedChatId) : null)?.title ||
          "Чат"
        }
        chatId={selectedChatId || undefined}
        onRename={() => {
          const chat = selectedChatId ? findChatAnywhere(selectedChatId) : null;
          if (chat) {
            setChatToRename({ id: chat.id, title: chat.title || "" });
            onRenameChatOpen();
            onChatActionsClose();
          }
        }}
        onAddToProject={() => console.log("Add to project")}
        onCopy={() => console.log("Copy chat")}
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
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        onMoveToProject={(chatId, projectId) => {
          updateChat(chatId, { project_id: projectId });
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
        onCreateProject={async (projectName) => {
          try {
            await createProject(projectName);
            setChatToMoveToNewProject(null);
            console.log("Created project:", projectName);
          } catch (error) {
            console.error("Failed to create project:", error);
            // TODO: Show error notification to user
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
      <EditProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => {
          setMobileProjectToEdit(null);
          onEditProjectClose();
        }}
        currentName={mobileProjectToEdit?.name || ""}
        currentDescription={mobileProjectToEdit?.description}
        onUpdateProject={mobileHandleUpdateProject}
      />
      <ProjectActionsModal
        isOpen={isProjectActionsOpen}
        onClose={onProjectActionsClose}
        position={mobileProjectActionsPosition}
        projectName={
          projects.find((p) => p.id === mobileSelectedProjectId)?.name || ""
        }
        projectId={mobileSelectedProjectId || 0}
        onEdit={mobileHandleProjectEdit}
        onDeleteConfirm={mobileHandleProjectDelete}
      />
      <NewChatModal
        isOpen={isMobileNewChatOpen}
        onClose={onMobileNewChatClose}
      />
    </>
  );
}
