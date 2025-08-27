// UI-related type definitions
import { IconType } from 'react-icons';

export interface QuickAction {
  id: string;
  label: string;
  icon: IconType;
  color: string;
  category?: string;
}

export interface NavbarProps {
  model: string;
  onModelChange: (model: string) => void;
  title?: string;
  showModelSelector?: boolean;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  routes: RouteItem[];
}

export interface RouteItem {
  id: string;
  name: string;
  path: string;
  icon: IconType;
  disabled?: boolean;
  badge?: string | number;
}

export type ComponentVariant = 'default' | 'compact' | 'minimal';

export interface BaseProps {
  className?: string;
  'data-testid'?: string;
}
