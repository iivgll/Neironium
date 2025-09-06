"use client";
import React, { useContext } from "react";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { SidebarContext } from "@/contexts/SidebarContext";
import ModelSelector from "./ModelSelector";
import { NeuroniumSidebarResponsive } from "@/components/sidebar/NeuroniumSidebar";

interface NeuroniumNavbarProps {
  model: string;
  onModelChange: (model: string) => void;
  hideModelSelector?: boolean;
}

export default function NeuroniumNavbar({
  model,
  onModelChange,
  hideModelSelector = false,
}: NeuroniumNavbarProps) {
  const { isCollapsed } = useContext(SidebarContext);

  // Dark theme colors only
  const bgColor = "transparent"; // Transparent background for navbar

  return (
    <Box
      position="fixed"
      top="0"
      right="0"
      left={{ base: 0, lg: isCollapsed ? "68px" : "300px" }}
      h="60px"
      bg={bgColor}
      zIndex={99}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      backdropFilter="blur(10px)"
    >
      <Flex
        h="100%"
        px={{ base: "16px", md: "24px" }}
        align="center"
        justify="space-between"
      >
        <HStack spacing="16px">
          {/* Mobile menu button */}
          <Box display={{ base: "block", lg: "none" }}>
            <NeuroniumSidebarResponsive />
          </Box>

          {/* Model Selector */}
          {!hideModelSelector && (
            <ModelSelector
              selectedModel={model}
              onModelChange={onModelChange}
            />
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
