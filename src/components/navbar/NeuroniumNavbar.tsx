"use client";
import React, { useContext } from "react";
import { Box, Flex, HStack, Button, Icon, IconButton } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";
import Image from "next/image";
import { SidebarContext } from "@/contexts/SidebarContext";
import ModelSelector from "./ModelSelector";
import { NeuroniumSidebarResponsive } from "@/components/sidebar/NeuroniumSidebar";
import { useAssetPath } from "@/hooks/useAssetPath";
import { COLORS } from "@/theme/colors";

interface NeuroniumNavbarProps {
  model: string;
  onModelChange: (model: string) => void;
  hideModelSelector?: boolean;
  onAddFile?: () => void;
  onToggleChatDetails?: () => void;
  isChatDetailsVisible?: boolean;
  chatId?: number;
}

export default function NeuroniumNavbar({
  model,
  onModelChange,
  hideModelSelector = false,
  onAddFile,
  onToggleChatDetails,
  isChatDetailsVisible = false,
  chatId,
}: NeuroniumNavbarProps) {
  const { isCollapsed } = useContext(SidebarContext);
  const { getAssetPath } = useAssetPath();

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
              chatId={chatId}
            />
          )}
        </HStack>

        {/* Right side buttons */}
        {!hideModelSelector && (
          <HStack spacing="12px">
            {/* Add File Button */}
            {onAddFile && (
              <>
                {/* Desktop version with text */}
                <Button
                  leftIcon={<Icon as={MdAdd} w="20px" h="20px" />}
                  size="sm"
                  variant="ghost"
                  color={COLORS.TEXT_PRIMARY}
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  _active={{ bg: "rgba(255, 255, 255, 0.15)" }}
                  onClick={onAddFile}
                  fontSize="14px"
                  fontWeight="500"
                  px="16px"
                  h="36px"
                  borderRadius="10px"
                  display={{ base: "none", md: "flex" }}
                >
                  Добавить файл
                </Button>

                {/* Mobile version - icon only */}
                <IconButton
                  aria-label="Добавить файл"
                  icon={<Icon as={MdAdd} w="20px" h="20px" />}
                  size="sm"
                  variant="ghost"
                  color={COLORS.TEXT_PRIMARY}
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  _active={{ bg: "rgba(255, 255, 255, 0.15)" }}
                  onClick={onAddFile}
                  w="36px"
                  h="36px"
                  minW="36px"
                  borderRadius="10px"
                  display={{ base: "flex", md: "none" }}
                />
              </>
            )}

            {/* Toggle Chat Details Button */}
            {onToggleChatDetails && (
              <IconButton
                aria-label={isChatDetailsVisible ? "Скрыть детали чата" : "Показать детали чата"}
                icon={
                  <Image
                    src={getAssetPath("/icons/minimize.svg")}
                    alt={isChatDetailsVisible ? "Minimize" : "Expand"}
                    width={20}
                    height={20}
                    style={{
                      transform: isChatDetailsVisible ? "rotate(0deg)" : "rotate(180deg)",
                      transition: "transform 0.3s ease",
                    }}
                  />
                }
                size="sm"
                variant="ghost"
                color={COLORS.TEXT_PRIMARY}
                bg={isChatDetailsVisible ? "rgba(99, 102, 241, 0.1)" : "rgba(255, 255, 255, 0.05)"}
                border="1px solid"
                borderColor={isChatDetailsVisible ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                _hover={{
                  bg: isChatDetailsVisible ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.1)",
                }}
                _active={{
                  bg: isChatDetailsVisible ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.15)",
                }}
                onClick={onToggleChatDetails}
                w="36px"
                h="36px"
                minW="36px"
                borderRadius="10px"
              />
            )}
          </HStack>
        )}
      </Flex>
    </Box>
  );
}
