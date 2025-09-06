"use client";
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import UserAvatar from "@/components/user/UserAvatar";
import { COLORS } from "@/theme/colors";

interface UserMessageProps {
  content: string;
  maxWidth?: string | { base: string; md: string };
}

const UserMessage = React.memo<UserMessageProps>(
  ({ content, maxWidth = "70%" }) => {
    return (
      <Flex
        w="100%"
        justify="flex-end"
        align="flex-end"
        gap={{ base: "8px", md: "12px" }}
        role="group"
        aria-label="User message"
      >
        {/* Message Box */}
        <Box
          maxW={maxWidth}
          bg={COLORS.ACCENT_VIOLET}
          color="white"
          px={{ base: "16px", md: "20px" }}
          py={{ base: "10px", md: "12px" }}
          borderRadius="16px"
          boxShadow="0 4px 12px rgba(136, 84, 243, 0.2)"
          position="relative"
          transition="all 0.2s ease-in-out"
          _hover={{
            boxShadow: "0 6px 16px rgba(136, 84, 243, 0.3)",
          }}
          _before={{
            content: '""',
            position: "absolute",
            right: "-8px",
            bottom: "12px",
            width: 0,
            height: 0,
            borderLeft: "8px solid",
            borderLeftColor: COLORS.ACCENT_VIOLET,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
          }}
        >
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight={{ base: "20px", md: "22px" }}
            fontWeight="500"
            wordBreak="break-word"
            overflowWrap="break-word"
          >
            {content}
          </Text>
        </Box>

        {/* User Avatar */}
        <Box flexShrink={0} alignSelf="flex-end">
          <UserAvatar
            size="sm"
            w={{ base: "32px", md: "36px" }}
            h={{ base: "32px", md: "36px" }}
          />
        </Box>
      </Flex>
    );
  },
);

UserMessage.displayName = "UserMessage";

export default UserMessage;
