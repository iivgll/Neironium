import React, { memo } from 'react';
import { Flex, HStack, IconButton, Button, Tooltip } from '@chakra-ui/react';
import { MdAttachFile, MdMic, MdSend, MdSearch } from 'react-icons/md';
import { COLORS } from '@/theme/colors';

interface InputActionsProps {
  showDeepSearch: boolean;
  onToggleDeepSearch: () => void;
  onSend: () => void;
  onAttach: () => void;
  hasMessage: boolean;
  hasAttachments: boolean;
  isLoading: boolean;
}

const InputActions = memo<InputActionsProps>(
  ({
    showDeepSearch,
    onToggleDeepSearch,
    onSend,
    onAttach,
    hasMessage,
    hasAttachments,
    isLoading,
  }) => {
    const iconColor = COLORS.TEXT_SECONDARY;
    const iconHoverColor = COLORS.TEXT_PRIMARY;
    const actionBg = COLORS.BG_HOVER;
    const deepSearchActiveBg = COLORS.ACCENT_VIOLET;

    return (
      <Flex
        borderTop="1px solid"
        borderColor={COLORS.BORDER_SECONDARY}
        px="12px"
        py="8px"
        align="center"
        justify="space-between"
        bg={COLORS.BG_HOVER}
      >
        {/* Left Side Actions */}
        <HStack spacing="8px">
          {/* Attach File Button */}
          <Tooltip label="Прикрепить файл" placement="top" hasArrow>
            <IconButton
              aria-label="Attach file"
              icon={<MdAttachFile size={20} />}
              variant="ghost"
              size="sm"
              color={iconColor}
              onClick={onAttach}
              _hover={{
                bg: actionBg,
                color: iconHoverColor,
              }}
              _active={{
                bg: COLORS.BG_ACTIVE,
              }}
              borderRadius="8px"
              minW="32px"
              h="32px"
              transition="all 0.2s"
            />
          </Tooltip>

          {/* Deep Research Button */}
          <Tooltip
            label={
              showDeepSearch
                ? 'Deep Research активен'
                : 'Включить Deep Research'
            }
            placement="top"
            hasArrow
          >
            <Button
              size="sm"
              variant={showDeepSearch ? 'solid' : 'ghost'}
              bg={showDeepSearch ? deepSearchActiveBg : 'transparent'}
              color={showDeepSearch ? 'white' : iconColor}
              leftIcon={<MdSearch size={16} />}
              onClick={onToggleDeepSearch}
              fontSize="14px"
              fontWeight="500"
              h="32px"
              px="12px"
              borderRadius="8px"
              _hover={{
                bg: showDeepSearch ? deepSearchActiveBg : actionBg,
                color: showDeepSearch ? 'white' : iconHoverColor,
              }}
              _active={{
                bg: showDeepSearch
                  ? COLORS.ACCENT_VIOLET_HOVER
                  : COLORS.BG_ACTIVE,
              }}
              transition="all 0.2s"
            >
              Deep Research
            </Button>
          </Tooltip>
        </HStack>

        {/* Right Side Actions */}
        <HStack spacing="8px">
          {/* Voice Input Button */}
          <Tooltip label="Голосовой ввод" placement="top" hasArrow>
            <IconButton
              aria-label="Voice input"
              icon={<MdMic size={20} />}
              variant="ghost"
              size="sm"
              color={iconColor}
              _hover={{
                bg: actionBg,
                color: iconHoverColor,
              }}
              _active={{
                bg: COLORS.BG_ACTIVE,
              }}
              borderRadius="8px"
              minW="32px"
              h="32px"
              transition="all 0.2s"
            />
          </Tooltip>

          {/* Send Button - Only visible when there's text or attachments */}
          {(hasMessage || hasAttachments) && (
            <Tooltip label="Отправить" placement="top" hasArrow>
              <IconButton
                aria-label="Send message"
                icon={<MdSend size={20} />}
                variant="solid"
                size="sm"
                bg={COLORS.ACCENT_VIOLET}
                color="white"
                onClick={onSend}
                isDisabled={(!hasMessage && !hasAttachments) || isLoading}
                isLoading={isLoading}
                _hover={{
                  bg: COLORS.ACCENT_VIOLET_HOVER,
                  transform: 'scale(1.05)',
                }}
                _active={{
                  bg: COLORS.ACCENT_VIOLET_ACTIVE,
                  transform: 'scale(0.98)',
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  transform: 'scale(1)',
                }}
                borderRadius="8px"
                minW="32px"
                h="32px"
                transition="all 0.2s"
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>
    );
  },
);

InputActions.displayName = 'InputActions';

export default InputActions;
