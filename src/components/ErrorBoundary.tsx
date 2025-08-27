'use client';
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Box, Text, Button, VStack, Heading, Icon } from '@chakra-ui/react';
import { MdError } from 'react-icons/md';
import { COLORS } from '@/theme/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH="400px"
          p="8"
          bg={COLORS.BG_SECONDARY}
          borderRadius="12px"
          border={`1px solid ${COLORS.BORDER_SECONDARY}`}
        >
          <VStack spacing="6" textAlign="center" maxW="md">
            <Icon as={MdError} w="16" h="16" color={COLORS.ERROR} />

            <Heading size="lg" color={COLORS.TEXT_PRIMARY}>
              Something went wrong
            </Heading>

            <Text color={COLORS.TEXT_SECONDARY} fontSize="md" lineHeight="1.6">
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </Text>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                as="pre"
                p="4"
                bg={COLORS.BG_PRIMARY}
                borderRadius="8px"
                border={`1px solid ${COLORS.BORDER_SECONDARY}`}
                fontSize="xs"
                color={COLORS.TEXT_SECONDARY}
                overflow="auto"
                maxW="100%"
                textAlign="left"
              >
                {this.state.error.message}
                {this.state.error.stack && `\n${this.state.error.stack}`}
              </Box>
            )}

            <Button
              onClick={this.handleReset}
              bg={COLORS.ACCENT_VIOLET}
              color="white"
              size="lg"
              _hover={{
                bg: COLORS.ACCENT_VIOLET_HOVER,
              }}
              _active={{
                bg: COLORS.ACCENT_VIOLET_ACTIVE,
              }}
            >
              Try Again
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
