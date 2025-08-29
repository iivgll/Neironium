'use client';
import { useReducer, useCallback } from 'react';
import { Chat } from '@/types/chat';

interface SidebarState {
  hoveredChatId: string | null;
  hoveredProjectId: string | null;
  actionsModalPosition: { x: number; y: number };
  selectedChatId: string | null;
  chatToDelete: Pick<Chat, 'id' | 'title'> | null;
  chatToRename: Pick<Chat, 'id' | 'title'> | null;
  chatToMoveToNewProject: string | null;
  editingChatId: string | null;
  editingChatTitle: string;
}

type SidebarAction =
  | { type: 'SET_HOVERED_CHAT'; payload: string | null }
  | { type: 'SET_HOVERED_PROJECT'; payload: string | null }
  | { type: 'SET_ACTIONS_MODAL_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_SELECTED_CHAT'; payload: string | null }
  | { type: 'SET_CHAT_TO_DELETE'; payload: Pick<Chat, 'id' | 'title'> | null }
  | { type: 'SET_CHAT_TO_RENAME'; payload: Pick<Chat, 'id' | 'title'> | null }
  | { type: 'SET_CHAT_TO_MOVE_TO_NEW_PROJECT'; payload: string | null }
  | { type: 'SET_EDITING_CHAT'; payload: { id: string | null; title: string } }
  | { type: 'RESET_STATE' };

const initialState: SidebarState = {
  hoveredChatId: null,
  hoveredProjectId: null,
  actionsModalPosition: { x: 0, y: 0 },
  selectedChatId: null,
  chatToDelete: null,
  chatToRename: null,
  chatToMoveToNewProject: null,
  editingChatId: null,
  editingChatTitle: '',
};

function sidebarReducer(
  state: SidebarState,
  action: SidebarAction,
): SidebarState {
  switch (action.type) {
    case 'SET_HOVERED_CHAT':
      return { ...state, hoveredChatId: action.payload };
    case 'SET_HOVERED_PROJECT':
      return { ...state, hoveredProjectId: action.payload };
    case 'SET_ACTIONS_MODAL_POSITION':
      return { ...state, actionsModalPosition: action.payload };
    case 'SET_SELECTED_CHAT':
      return { ...state, selectedChatId: action.payload };
    case 'SET_CHAT_TO_DELETE':
      return { ...state, chatToDelete: action.payload };
    case 'SET_CHAT_TO_RENAME':
      return { ...state, chatToRename: action.payload };
    case 'SET_CHAT_TO_MOVE_TO_NEW_PROJECT':
      return { ...state, chatToMoveToNewProject: action.payload };
    case 'SET_EDITING_CHAT':
      return {
        ...state,
        editingChatId: action.payload.id,
        editingChatTitle: action.payload.title,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

export function useSidebarState() {
  const [state, dispatch] = useReducer(sidebarReducer, initialState);

  const setHoveredChatId = useCallback((chatId: string | null) => {
    dispatch({ type: 'SET_HOVERED_CHAT', payload: chatId });
  }, []);

  const setHoveredProjectId = useCallback((projectId: string | null) => {
    dispatch({ type: 'SET_HOVERED_PROJECT', payload: projectId });
  }, []);

  const setActionsModalPosition = useCallback(
    (position: { x: number; y: number }) => {
      dispatch({ type: 'SET_ACTIONS_MODAL_POSITION', payload: position });
    },
    [],
  );

  const setSelectedChatId = useCallback((chatId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CHAT', payload: chatId });
  }, []);

  const setChatToDelete = useCallback(
    (chat: Pick<Chat, 'id' | 'title'> | null) => {
      dispatch({ type: 'SET_CHAT_TO_DELETE', payload: chat });
    },
    [],
  );

  const setChatToRename = useCallback(
    (chat: Pick<Chat, 'id' | 'title'> | null) => {
      dispatch({ type: 'SET_CHAT_TO_RENAME', payload: chat });
    },
    [],
  );

  const setChatToMoveToNewProject = useCallback((chatId: string | null) => {
    dispatch({ type: 'SET_CHAT_TO_MOVE_TO_NEW_PROJECT', payload: chatId });
  }, []);

  const setEditingChat = useCallback(
    (id: string | null, title: string = '') => {
      dispatch({ type: 'SET_EDITING_CHAT', payload: { id, title } });
    },
    [],
  );

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  return {
    ...state,
    setHoveredChatId,
    setHoveredProjectId,
    setActionsModalPosition,
    setSelectedChatId,
    setChatToDelete,
    setChatToRename,
    setChatToMoveToNewProject,
    setEditingChat,
    resetState,
  };
}
