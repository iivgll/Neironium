import { useCallback } from 'react';
import { IconType } from 'react-icons';
import { 
  FaStar, 
  FaBook, 
  FaLightbulb, 
  FaChartLine, 
  FaCogs, 
  FaHeart 
} from 'react-icons/fa';
import { COLORS } from '@/theme/colors';

export interface QuickAction {
  id: string;
  label: string;
  icon: IconType;
  color: string;
}

export const useQuickActions = (onActionSelect: (prompt: string) => void) => {
  const quickActions: QuickAction[] = [
    { id: 'health', label: 'Здоровье', icon: FaStar, color: COLORS.TAG_HEALTH },
    { id: 'education', label: 'Образование', icon: FaBook, color: COLORS.TAG_EDUCATION },
    { id: 'productivity', label: 'Продуктивность', icon: FaLightbulb, color: COLORS.TAG_PRODUCTIVITY },
    { id: 'goals', label: 'Личные дела', icon: FaChartLine, color: COLORS.TAG_GOALS },
    { id: 'development', label: 'Развлечение', icon: FaCogs, color: COLORS.TAG_DEVELOPMENT },
    { id: 'relationships', label: 'Отношения', icon: FaHeart, color: COLORS.TAG_RELATIONSHIPS },
  ];

  const handleQuickAction = useCallback((action: QuickAction) => {
    const prompts = {
      health: 'Расскажи про здоровый образ жизни',
      education: 'Помоги мне с обучением',
      productivity: 'Как повысить продуктивность?',
      goals: 'Помоги поставить личные цели',
      development: 'Предложи идеи для развлечения',
      relationships: 'Дай советы по отношениям',
    };
    
    const prompt = prompts[action.id as keyof typeof prompts];
    if (prompt) {
      onActionSelect(prompt);
    }
  }, [onActionSelect]);

  return { quickActions, handleQuickAction };
};