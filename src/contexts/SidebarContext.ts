import { createContext, Dispatch, SetStateAction } from 'react';

interface SidebarContextType {
  toggleSidebar: boolean;
  setToggleSidebar: Dispatch<SetStateAction<boolean>>;
  sidebarWidth?: number;
  isCollapsed?: boolean;
  setIsCollapsed?: Dispatch<SetStateAction<boolean>>;
}

export const SidebarContext = createContext<Partial<SidebarContextType>>({});
