"use client";
import React, { useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { MdKeyboardArrowDown, MdCheck } from "react-icons/md";

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const models: ModelOption[] = [
  { id: "gpt-4o", name: "ChatGpt 5", description: "Описание" },
  { id: "gpt-4", name: "ChatGpt 4", description: "Описание" },
  { id: "gpt-3.5-turbo", name: "ChatGpt 3.5", description: "Описание" },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector = React.memo(function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  // Dark theme colors only - memoized to prevent re-creation
  const colors = useMemo(
    () => ({
      borderColor: "#343434", // neuronium.border.primary
      textColor: "#ffffff", // neuronium.text.primary
      textSecondary: "#8a8b8c", // neuronium.text.secondary
      menuBg: "#2a2a2a", // neuronium.background.tertiary
      hoverBg: "rgba(255, 255, 255, 0.05)", // neuronium.background.hover
      activeColor: "#fafafaff", // neuronium.accent.violet
    }),
    [],
  );

  const currentModel = useMemo(
    () => models.find((m) => m.id === selectedModel) || models[0],
    [selectedModel],
  );

  const handleModelChange = useCallback(
    (modelId: string) => {
      onModelChange(modelId);
    },
    [onModelChange],
  );

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<MdKeyboardArrowDown />}
        bg="transparent"
        color={colors.textColor}
        fontWeight="500"
        fontSize="16px"
        _hover={{ bg: colors.hoverBg }}
        _active={{ bg: colors.hoverBg }}
        _focus={{ boxShadow: "none" }}
        px="12px"
        py="6px"
        h="auto"
      >
        <HStack spacing="8px">
          <Text>{currentModel.name}</Text>
        </HStack>
      </MenuButton>

      <MenuList
        bg={colors.menuBg}
        borderColor={colors.borderColor}
        borderRadius="12px"
        p="8px"
        minW="240px"
        boxShadow="0 4px 24px rgba(0, 0, 0, 0.2)"
      >
        {models.map((model) => (
          <MenuItem
            key={model.id}
            onClick={() => handleModelChange(model.id)}
            bg="transparent"
            _hover={{ bg: colors.hoverBg }}
            borderRadius="8px"
            p="12px"
            transition="all 0.2s"
          >
            <Box flex="1">
              <HStack justify="space-between" w="100%">
                <Box>
                  <Text
                    color={colors.textColor}
                    fontWeight="500"
                    fontSize="14px"
                  >
                    {model.name}
                  </Text>
                  <Text color={colors.textSecondary} fontSize="12px" mt="2px">
                    {model.description}
                  </Text>
                </Box>
                {currentModel.id === model.id && (
                  <Icon
                    as={MdCheck}
                    color={colors.activeColor}
                    w="20px"
                    h="20px"
                  />
                )}
              </HStack>
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});

export default ModelSelector;
