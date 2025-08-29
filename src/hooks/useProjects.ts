'use client';
import { useState, useCallback, useMemo } from 'react';
import { Project, Chat } from '@/types/chat';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const createProject = useCallback(
    (name: string, initialChats: Chat[] = []) => {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name,
        chats: initialChats,
        isExpanded: true,
      };
      setProjects((prev) => [...prev, newProject]);
      return newProject.id;
    },
    [],
  );

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  }, []);

  const updateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, ...updates } : project,
        ),
      );
    },
    [],
  );

  const toggleProjectExpansion = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, isExpanded: !project.isExpanded }
          : project,
      ),
    );
  }, []);

  const addChatToProject = useCallback((projectId: string, chat: Chat) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, chats: [...project.chats, chat] }
          : project,
      ),
    );
  }, []);

  const removeChatFromProject = useCallback(
    (projectId: string, chatId: string) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                chats: project.chats.filter((chat) => chat.id !== chatId),
              }
            : project,
        ),
      );
    },
    [],
  );

  const removeChatFromAllProjects = useCallback((chatId: string) => {
    setProjects((prev) =>
      prev.map((project) => ({
        ...project,
        chats: project.chats.filter((chat) => chat.id !== chatId),
      })),
    );
  }, []);

  const setActiveChatInProjects = useCallback((chatId: string) => {
    setProjects((prev) =>
      prev.map((project) => ({
        ...project,
        chats: project.chats.map((chat) => ({
          ...chat,
          isActive: chat.id === chatId,
        })),
      })),
    );
  }, []);

  const updateChatInProjects = useCallback(
    (chatId: string, updates: Partial<Chat>) => {
      setProjects((prev) =>
        prev.map((project) => ({
          ...project,
          chats: project.chats.map((chat) =>
            chat.id === chatId ? { ...chat, ...updates } : chat,
          ),
        })),
      );
    },
    [],
  );

  const getProject = useCallback(
    (projectId: string) => {
      return projects.find((project) => project.id === projectId);
    },
    [projects],
  );

  const projectsCount = useMemo(() => projects.length, [projects]);

  return {
    projects,
    setProjects,
    createProject,
    deleteProject,
    updateProject,
    toggleProjectExpansion,
    addChatToProject,
    removeChatFromProject,
    removeChatFromAllProjects,
    setActiveChatInProjects,
    updateChatInProjects,
    getProject,
    projectsCount,
  };
}
