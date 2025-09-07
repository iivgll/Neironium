import React from "react";
import { Flex, HStack, IconButton, Button, Image } from "@chakra-ui/react";
import { COLORS } from "@/theme/colors";

interface InputActionsProps {
  showDeepSearch: boolean;
  onToggleDeepSearch: () => void;
  onSend: () => void;
  onAttach: () => void;
  hasMessage: boolean;
  hasAttachments: boolean;
  isLoading: boolean;
}

// Простые статические стили - никаких хуков!
const basePath = ""; // Убираем basePath для Vercel деплоя
const getStaticAssetPath = (path: string) => {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${basePath}/${cleanPath}`;
};

function InputActions({
  showDeepSearch,
  onToggleDeepSearch,
  onSend,
  onAttach,
  hasMessage,
  hasAttachments,
  isLoading,
}: InputActionsProps) {
  return (
    <Flex
      px="12px"
      py="8px"
      align="center"
      justify="space-between"
      bg={COLORS.BG_SECONDARY}
    >
      {/* Left Side Actions */}
      <HStack spacing="8px">
        {/* Attach File Button - БЕЗ TOOLTIP */}
        <IconButton
          aria-label="Прикрепить файл"
          title="Прикрепить файл"
          icon={
            <Image
              src={getStaticAssetPath("/icons/pin.svg")}
              alt="pin"
              w="20px"
              h="20px"
            />
          }
          variant="ghost"
          size="sm"
          color={COLORS.TEXT_SECONDARY}
          onClick={onAttach}
          _hover={{ bg: COLORS.BG_HOVER, color: COLORS.TEXT_PRIMARY }}
          _active={{ bg: COLORS.BG_ACTIVE }}
          borderRadius="8px"
          minW="32px"
          h="32px"
          transition="all 0.2s"
        />

        {/* Deep Research Button - БЕЗ TOOLTIP */}
        <Button
          size="sm"
          variant={showDeepSearch ? "solid" : "ghost"}
          bg={showDeepSearch ? "rgba(255, 255, 255, 0.1)" : "transparent"}
          color={showDeepSearch ? "white" : COLORS.TEXT_SECONDARY}
          leftIcon={
            <Image
              src={getStaticAssetPath("/icons/magnifer.svg")}
              alt="search"
              w="20px"
              h="20px"
            />
          }
          onClick={onToggleDeepSearch}
          fontSize="14px"
          fontWeight="500"
          h="32px"
          px="12px"
          borderRadius="8px"
          _hover={
            showDeepSearch
              ? { bg: "rgba(255, 255, 255, 0.1)", color: "white" }
              : { bg: COLORS.BG_HOVER, color: COLORS.TEXT_PRIMARY }
          }
          _active={
            showDeepSearch
              ? { bg: COLORS.ACCENT_VIOLET_HOVER }
              : { bg: COLORS.BG_ACTIVE }
          }
          transition="all 0.2s"
          title={
            showDeepSearch ? "Deep Research активен" : "Включить Deep Research"
          }
        >
          Deep Research
        </Button>
      </HStack>

      {/* Right Side Actions */}
      <HStack spacing="8px">
        {/* Voice Input Button - БЕЗ TOOLTIP */}
        <IconButton
          aria-label="Голосовой ввод"
          title="Голосовой ввод"
          icon={
            <Image
              src={getStaticAssetPath("/icons/microphone.svg")}
              alt="microphone"
              w="20px"
              h="20px"
            />
          }
          variant="ghost"
          size="sm"
          color={COLORS.TEXT_SECONDARY}
          _hover={{ bg: COLORS.BG_HOVER, color: COLORS.TEXT_PRIMARY }}
          _active={{ bg: COLORS.BG_ACTIVE }}
          borderRadius="8px"
          minW="32px"
          h="32px"
          transition="all 0.2s"
        />

        {/* Send Button - БЕЗ TOOLTIP */}
        {(hasMessage || hasAttachments) && (
          <IconButton
            aria-label="Отправить"
            title="Отправить"
            icon={
              <Image src={getStaticAssetPath("/icons/arrow_right.svg")} alt="send" w="20px" h="20px" />
            }
            variant="solid"
            size="sm"
            onClick={onSend}
            isDisabled={(!hasMessage && !hasAttachments) || isLoading}
            isLoading={isLoading}
            _hover={{
              bg: COLORS.ACCENT_VIOLET_HOVER,
              transform: "scale(1.05)",
            }}
            _active={{
              bg: COLORS.ACCENT_VIOLET_ACTIVE,
              transform: "scale(0.98)",
            }}
            _disabled={{
              opacity: 0.5,
              cursor: "not-allowed",
              transform: "scale(1)",
            }}
            minW="32px"
            h="32px"
            transition="all 0.2s"
          />
        )}
      </HStack>
    </Flex>
  );
}

export default InputActions;
