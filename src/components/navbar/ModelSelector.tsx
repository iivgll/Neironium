'use client';
import React from 'react';
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
} from '@chakra-ui/react';
import { MdKeyboardArrowDown, MdCheck } from 'react-icons/md';

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const models: ModelOption[] = [
  { id: 'gpt-4o', name: 'ChatGpt 5', description: 'Описание' },
  { id: 'gpt-4', name: 'ChatGpt 4', description: 'Описание' },
  { id: 'gpt-3.5-turbo', name: 'ChatGpt 3.5', description: 'Описание' },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  // Dark theme colors only
  const bgColor = '#343434'; // neuronium.background.secondary
  const borderColor = '#343434'; // neuronium.border.primary
  const textColor = '#ffffff'; // neuronium.text.primary
  const textSecondary = '#8a8b8c'; // neuronium.text.secondary
  const menuBg = '#2a2a2a'; // neuronium.background.tertiary
  const hoverBg = 'rgba(255, 255, 255, 0.05)'; // neuronium.background.hover
  const activeColor = '#fafafaff'; // neuronium.accent.violet

  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<MdKeyboardArrowDown />}
        bg="transparent"
        color={textColor}
        fontWeight="500"
        fontSize="16px"
        _hover={{ bg: hoverBg }}
        _active={{ bg: hoverBg }}
        _focus={{ boxShadow: 'none' }}
        px="12px"
        py="6px"
        h="auto"
      >
        <HStack spacing="8px">
          <Text>{currentModel.name}</Text>
        </HStack>
      </MenuButton>

      <MenuList
        bg={menuBg}
        borderColor={borderColor}
        borderRadius="12px"
        p="8px"
        minW="240px"
        boxShadow="0 4px 24px rgba(0, 0, 0, 0.2)"
      >
        {models.map((model) => (
          <MenuItem
            key={model.id + model.name}
            onClick={() => onModelChange(model.id)}
            bg="transparent"
            _hover={{ bg: hoverBg }}
            borderRadius="8px"
            p="12px"
            transition="all 0.2s"
          >
            <Box flex="1">
              <HStack justify="space-between" w="100%">
                <Box>
                  <Text color={textColor} fontWeight="500" fontSize="14px">
                    {model.name}
                  </Text>
                  <Text color={textSecondary} fontSize="12px" mt="2px">
                    {model.description}
                  </Text>
                </Box>
                {currentModel.name === model.name && (
                  <Icon as={MdCheck} color={activeColor} w="20px" h="20px" />
                )}
              </HStack>
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
