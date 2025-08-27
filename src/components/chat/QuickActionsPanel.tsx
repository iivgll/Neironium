import React, { memo } from 'react';
import {
  Flex,
  Button,
  Icon,
} from '@chakra-ui/react';
import { useQuickActions, QuickAction } from '@/hooks/useQuickActions';
import { COLORS } from '@/theme/colors';

interface QuickActionsPanelProps {
  onActionSelect: (prompt: string) => void;
}

const QuickActionsPanel = memo<QuickActionsPanelProps>(({ onActionSelect }) => {
  const { quickActions, handleQuickAction } = useQuickActions(onActionSelect);

  const handleActionClick = (action: QuickAction) => {
    handleQuickAction(action);
  };

  return (
    <Flex
      flexWrap="wrap"
      gap="6px"
      mt="12px"
      justify="center"
      align="center"
    >
      {quickActions.map((action) => (
        <Button
          key={action.id}
          size="xs"
          variant="ghost"
          leftIcon={<Icon as={action.icon} color={action.color} boxSize="14px" />}
          onClick={() => handleActionClick(action)}
          px="12px"
          py="4px"
          h="28px"
          bg={COLORS.BG_HOVER}
          borderRadius="100px"
          color={COLORS.TEXT_PRIMARY}
          _hover={{
            bg: action.color,
            color: 'white',
            '& svg': {
              color: 'white',
            },
          }}
          _active={{
            transform: 'scale(0.98)',
          }}
          whiteSpace="nowrap"
          fontSize="13px"
          fontWeight="500"
          transition="all 0.2s"
        >
          {action.label}
        </Button>
      ))}
    </Flex>
  );
});

QuickActionsPanel.displayName = 'QuickActionsPanel';

export default QuickActionsPanel;