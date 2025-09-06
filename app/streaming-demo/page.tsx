"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  Container,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { useChat } from "@/hooks/useChat";
import MessageBoxChat from "@/components/messages/MessageBox";

export default function StreamingDemo() {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<number>(1); // Test chat ID

  const { messages, isLoading, isStreaming, error, sendMessage, loadMessages } =
    useChat(selectedChatId);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    await sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleLoadMessages = () => {
    loadMessages();
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Streaming Demo - Phase 5
        </Heading>

        <Text textAlign="center" color="gray.400">
          Test streaming functionality with the new API integration
        </Text>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box borderWidth={1} borderRadius="md" p={4}>
          <Text fontWeight="bold" mb={2}>
            Current Chat ID: {selectedChatId}
          </Text>
          <HStack>
            <Input
              type="number"
              value={selectedChatId}
              onChange={(e) => setSelectedChatId(Number(e.target.value) || 1)}
              placeholder="Enter chat ID"
              maxW="200px"
            />
            <Button onClick={handleLoadMessages} isLoading={isLoading}>
              Load Messages
            </Button>
          </HStack>
        </Box>

        <Divider />

        <Box borderWidth={1} borderRadius="md" p={4} minH="400px" bg="gray.900">
          <Text fontWeight="bold" mb={4}>
            Messages ({messages.length})
          </Text>
          <VStack spacing={4} align="stretch">
            {messages.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No messages yet. Try sending a message or loading existing ones.
              </Text>
            ) : (
              messages.map((message, index) => (
                <Box key={message.id || index}>
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    {message.role.toUpperCase()} -{" "}
                    {new Date(message.created_at).toLocaleTimeString()}
                  </Text>
                  {message.role === "user" ? (
                    <Box bg="blue.800" p={3} borderRadius="md">
                      <Text>{message.content}</Text>
                    </Box>
                  ) : (
                    <MessageBoxChat
                      output={message.content}
                      isStreaming={index === messages.length - 1 && isStreaming}
                      showTypingIndicator={
                        index === messages.length - 1 &&
                        isStreaming &&
                        !message.content
                      }
                    />
                  )}
                </Box>
              ))
            )}
          </VStack>
        </Box>

        <HStack>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            isLoading={isStreaming}
            loadingText="Sending..."
            colorScheme="purple"
          >
            Send
          </Button>
        </HStack>

        <Box borderWidth={1} borderRadius="md" p={4} bg="gray.800">
          <Text fontWeight="bold" mb={2}>
            Status
          </Text>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm">Loading: {isLoading ? "Yes" : "No"}</Text>
            <Text fontSize="sm">Streaming: {isStreaming ? "Yes" : "No"}</Text>
            <Text fontSize="sm">Messages: {messages.length}</Text>
            <Text fontSize="sm">Chat ID: {selectedChatId}</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
