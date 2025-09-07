import React, { memo } from "react";
import { Flex, Button, Icon } from "@chakra-ui/react";
import { useQuickActions, QuickAction } from "@/hooks/useQuickActions";
import { COLORS } from "@/theme/colors";

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
      gap={["4px", "6px"]}
      mt="12px"
      justify="center"
      align="center"
      w="full"
      px={["2px", "0"]}
      overflowX="hidden"
    >
      {quickActions.map((action) => (
        <Button
          key={action.id}
          size="xs"
          variant="ghost"
          leftIcon={
            <Icon as={action.icon} color={action.color} boxSize="14px" />
          }
          onClick={() => handleActionClick(action)}
          px={["8px", "12px"]}
          py="4px"
          h={["26px", "28px"]}
          bg={COLORS.BG_HOVER}
          borderRadius="100px"
          color={COLORS.TEXT_PRIMARY}
          _hover={{
            bg: action.color,
            color: "white",
            "& svg": {
              color: "white",
            },
          }}
          _active={{
            transform: "scale(0.98)",
          }}
          whiteSpace="nowrap"
          fontSize={["12px", "13px"]}
          fontWeight="500"
          transition="all 0.2s"
          flex="0 0 auto"
          minW="fit-content"
          maxW={["calc(50% - 2px)", "none"]}
        >
          {action.label}
        </Button>
      ))}
    </Flex>
  );
});

QuickActionsPanel.displayName = "QuickActionsPanel";

export default QuickActionsPanel;
