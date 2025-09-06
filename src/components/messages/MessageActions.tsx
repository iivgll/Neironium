"use client";
import React, { useState } from "react";
import { HStack, IconButton, useToast, Tooltip } from "@chakra-ui/react";
import { CopyIcon, RepeatIcon } from "@chakra-ui/icons";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  isLastMessage?: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  onRegenerate,
  isLastMessage = false,
}) => {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      // Удаляем markdown форматирование для копирования
      const plainText = content
        .replace(/#{1,6}\s/g, "") // Удаляем заголовки
        .replace(/\*\*(.*?)\*\*/g, "$1") // Удаляем жирный текст
        .replace(/\*(.*?)\*/g, "$1") // Удаляем курсив
        .replace(/`(.*?)`/g, "$1") // Удаляем inline код
        .replace(/```[\s\S]*?```/g, "") // Удаляем блоки кода
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Удаляем ссылки

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      toast({
        title: "Скопировано!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Ошибка копирования",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleLike = () => {
    setLiked(liked === true ? null : true);
  };

  const handleDislike = () => {
    setLiked(liked === false ? null : false);
  };

  return (
    <HStack
      spacing={{ base: 1, md: 2 }}
      mt={3}
      opacity={1}
      transition="opacity 0.2s"
    >
      <Tooltip label="Нравится" placement="top" hasArrow>
        <IconButton
          aria-label="Like"
          icon={<FiThumbsUp />}
          size="sm"
          variant="ghost"
          color={liked === true ? "green.400" : "white"}
          opacity={liked === true ? 1 : 0.6}
          _hover={{
            bg: "rgba(255, 255, 255, 0.1)",
            color: liked === true ? "green.300" : "white",
            opacity: 1,
          }}
          onClick={handleLike}
        />
      </Tooltip>

      <Tooltip label="Не нравится" placement="top" hasArrow>
        <IconButton
          aria-label="Dislike"
          icon={<FiThumbsDown />}
          size="sm"
          variant="ghost"
          color={liked === false ? "red.400" : "white"}
          opacity={liked === false ? 1 : 0.6}
          _hover={{
            bg: "rgba(255, 255, 255, 0.1)",
            color: liked === false ? "red.300" : "white",
            opacity: 1,
          }}
          onClick={handleDislike}
        />
      </Tooltip>

      <Tooltip
        label={copied ? "Скопировано!" : "Копировать"}
        placement="top"
        hasArrow
      >
        <IconButton
          aria-label="Copy"
          icon={<CopyIcon />}
          size="sm"
          variant="ghost"
          color={copied ? "green.400" : "white"}
          opacity={copied ? 1 : 0.6}
          _hover={{
            bg: "rgba(255, 255, 255, 0.1)",
            color: copied ? "green.300" : "white",
            opacity: 1,
          }}
          onClick={handleCopy}
        />
      </Tooltip>

      {isLastMessage && onRegenerate && (
        <Tooltip label="Перегенерировать" placement="top" hasArrow>
          <IconButton
            aria-label="Regenerate"
            icon={<RepeatIcon />}
            size="sm"
            variant="ghost"
            color="white"
            opacity={0.6}
            _hover={{
              bg: "rgba(255, 255, 255, 0.1)",
              color: "white",
              opacity: 1,
            }}
            onClick={onRegenerate}
          />
        </Tooltip>
      )}
    </HStack>
  );
};

export default MessageActions;
