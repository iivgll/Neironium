"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ProjectRead } from "@/types/api";
import { apiClient } from "@/utils/apiClient";
import { useAuth } from "./AuthContext";

interface ProjectsContextType {
  projects: ProjectRead[];
  currentProject: ProjectRead | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<ProjectRead>;
  updateProject: (
    id: number,
    data: { name?: string; description?: string },
  ) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  setCurrentProject: (project: ProjectRead | null) => void;
}

const ProjectsContext = createContext<ProjectsContextType | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectRead | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getProjects();
      setProjects(response.items);

      // TODO: Implement pagination for large project lists
    } catch (error) {
      console.error("Failed to load projects:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load projects",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (
    name: string,
    description?: string,
  ): Promise<ProjectRead> => {
    try {
      setError(null);
      const newProject = await apiClient.createProject({ name, description });
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error("Failed to create project:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create project";
      setError(errorMessage);
      throw error;
    }
  };

  const updateProject = async (
    id: number,
    data: { name?: string; description?: string },
  ) => {
    try {
      setError(null);
      const updatedProject = await apiClient.updateProject(id, data);

      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updatedProject : project)),
      );

      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update project",
      );
      throw error;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      setError(null);
      await apiClient.deleteProject(id);

      setProjects((prev) => prev.filter((project) => project.id !== id));

      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete project",
      );
      throw error;
    }
  };

  const value: ProjectsContextType = {
    projects,
    currentProject,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects(): ProjectsContextType {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}
