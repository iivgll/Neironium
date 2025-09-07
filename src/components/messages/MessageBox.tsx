"use client";
import React from "react";
import Card from "@/components/card/Card";
import { COLORS } from "@/theme/colors";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box } from "@chakra-ui/react";

interface MessageBoxProps {
  output: string;
  isStreaming?: boolean;
  isLastMessage?: boolean;
}

const MessageBox = React.memo<MessageBoxProps>(
  ({ output, isStreaming = false, isLastMessage = false }) => {
    const textColor = COLORS.TEXT_PRIMARY;

    console.log("📦 MessageBox render:", {
      outputLength: output?.length || 0,
      isStreaming,
      isLastMessage,
      hasOutput: !!output,
    });

    // Показываем компонент если:
    // 1. Это последнее сообщение (даже без контента)
    // 2. Или есть контент
    const shouldDisplay = isLastMessage || output;

    if (!shouldDisplay) return null;

    return (
      <Card
        display="flex"
        pr="22px !important"
        pl="0 !important"
        color={textColor}
        fontSize={{ base: "sm", md: "md" }}
        lineHeight={{ base: "24px", md: "26px" }}
        fontWeight="500"
        flexDirection="column"
        position="relative"
        alignItems="flex-start"
      >
        {/* Контейнер для контента */}
        <Box width="100%">
          {/* Контент сообщения с плавным появлением */}
          {output ? (
            <Box
              sx={{
                "@keyframes fadeInText": {
                  "0%": { opacity: 0 },
                  "100%": { opacity: 1 },
                },
                "& > *": isStreaming
                  ? {
                      animation: "fadeInText 0.5s ease-in-out",
                    }
                  : {},
                "& p": {
                  marginBottom: "16px",
                  lineHeight: "1.6",
                  "&:last-child": {
                    marginBottom: 0,
                  },
                },
                "& h1": {
                  fontSize: "24px",
                  fontWeight: "700",
                  marginTop: "24px",
                  marginBottom: "16px",
                  "&:first-of-type": {
                    marginTop: 0,
                  },
                },
                "& h2": {
                  fontSize: "20px",
                  fontWeight: "600",
                  marginTop: "20px",
                  marginBottom: "12px",
                },
                "& h3": {
                  fontSize: "18px",
                  fontWeight: "600",
                  marginTop: "16px",
                  marginBottom: "8px",
                },
                "& strong": {
                  fontWeight: "600",
                  color: COLORS.TEXT_PRIMARY,
                },
                "& ul, & ol": {
                  paddingLeft: "24px",
                  marginBottom: "16px",
                },
                "& li": {
                  marginBottom: "8px",
                  lineHeight: "1.6",
                },
                "& code": {
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "purple.300",
                },
                "& pre": {
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  padding: "16px",
                  borderRadius: "8px",
                  overflow: "auto",
                  marginBottom: "16px",
                  "& code": {
                    backgroundColor: "transparent",
                    padding: 0,
                  },
                },
                "& blockquote": {
                  borderLeft: "4px solid",
                  borderLeftColor: "purple.400",
                  paddingLeft: "16px",
                  marginLeft: 0,
                  marginBottom: "16px",
                  fontStyle: "italic",
                  opacity: 0.9,
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  marginTop: "16px",
                  marginBottom: "16px",
                },
                "& a": {
                  color: "purple.400",
                  textDecoration: "underline",
                  "&:hover": {
                    color: "purple.300",
                  },
                },
                "& hr": {
                  border: "none",
                  borderTop: "1px solid",
                  borderTopColor: "rgba(255, 255, 255, 0.1)",
                  marginTop: "24px",
                  marginBottom: "24px",
                },
                "& table": {
                  width: "100%",
                  marginBottom: "16px",
                  borderCollapse: "collapse",
                  "& th, & td": {
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "8px 12px",
                    textAlign: "left",
                  },
                  "& th": {
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    fontWeight: "600",
                  },
                },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {output}
              </ReactMarkdown>
            </Box>
          ) : (
            // Пока нет контента, показываем пустое место или можно добавить placeholder
            <Box minHeight="20px" />
          )}

          {/* Курсор при стриминге */}
          {isStreaming && output && (
            <Box
              as="span"
              display="inline-block"
              width="3px"
              height="18px"
              bg="purple.300"
              animation="blink 0.8s infinite"
              ml={1}
              sx={{
                "@keyframes blink": {
                  "0%, 40%": { opacity: 1 },
                  "41%, 100%": { opacity: 0.2 },
                },
              }}
            />
          )}
        </Box>
      </Card>
    );
  },
);

MessageBox.displayName = "MessageBox";

export default MessageBox;
