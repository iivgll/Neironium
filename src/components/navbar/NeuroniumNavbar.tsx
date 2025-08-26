'use client';
import React, { useContext } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { SidebarContext } from '@/contexts/SidebarContext';
import ModelSelector from './ModelSelector';
import { MdMenu } from 'react-icons/md';
import { NeuroniumSidebarResponsive } from '@/components/sidebar/NeuroniumSidebar';
import routes from '@/routes';

interface NeuroniumNavbarProps {
  model: string;
  onModelChange: (model: string) => void;
}

export default function NeuroniumNavbar({ model, onModelChange }: NeuroniumNavbarProps) {
  const { isCollapsed } = useContext(SidebarContext);
  
  // Dark theme colors only
  const bgColor = 'transparent'; // Transparent background for navbar
  const borderColor = '#343434'; // neuronium.border.primary
  const textColor = '#ffffff'; // neuronium.text.primary

  return (
    <Box
      position="fixed"
      top="0"
      right="0"
      left={{ base: 0, lg: isCollapsed ? '68px' : '300px' }}
      h="60px"
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      zIndex={99}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      backdropFilter="blur(10px)"
    >
      <Flex
        h="100%"
        px={{ base: '16px', md: '24px' }}
        align="center"
        justify="space-between"
      >
        <HStack spacing="16px">
          {/* Mobile menu button */}
          <Box display={{ base: 'block', lg: 'none' }}>
            <NeuroniumSidebarResponsive routes={routes} />
          </Box>
          
          {/* Model Selector */}
          <ModelSelector 
            selectedModel={model}
            onModelChange={onModelChange}
          />
        </HStack>

        <HStack spacing="16px">
          {/* Additional navbar items can go here */}
        </HStack>
      </Flex>
    </Box>
  );
}