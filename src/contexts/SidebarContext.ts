import { createContext, Dispatch, SetStateAction } from 'react';

interface SidebarContextType {
  toggleSidebar: boolean;
  setToggleSidebar: Dispatch<SetStateAction<boolean>>;
  sidebarWidth: number;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

// Default values ensuring no undefined values can be passed
const defaultSidebarContext: SidebarContextType = {
  toggleSidebar: false,
  setToggleSidebar: () => {},
  sidebarWidth: 300,
  isCollapsed: false,
  setIsCollapsed: () => {},
};

export const SidebarContext = createContext<SidebarContextType>(defaultSidebarContext);
