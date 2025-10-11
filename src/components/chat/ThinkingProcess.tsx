"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import Lottie from "react-lottie-player";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useAssetPath } from "@/hooks/useAssetPath";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ThinkingProcessProps {
  isThinking?: boolean;
  onToggle?: () => void;
  isExpanded?: boolean;
  hasCompleted?: boolean; // Новый пропс - показывать ли после завершения
  thinkingText?: string; // Текст размышления для конкретного сообщения
}

const mockThinkingText = `Хм, интересный вопрос. Мне нужно хорошо подумать над этим...

## Анализ запроса

Пользователь спрашивает о чём-то **важном**. Мне нужно рассмотреть несколько аспектов:

1. **Контекст** - что именно пользователь хочет узнать?
2. **Глубина** - насколько подробный ответ нужен?
3. **Примеры** - нужны ли конкретные примеры?

## Структурирование ответа

Я думаю, лучше всего будет организовать ответ следующим образом:

- Начать с общего объяснения
- Привести ключевые моменты
- Завершить практическими рекомендациями

Ок, теперь я готов сформулировать исчерпывающий ответ...`;

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({
  isThinking = false,
  onToggle,
  isExpanded = false,
  hasCompleted = false,
  thinkingText,
}) => {
  const { getAssetPath } = useAssetPath();
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [displayedThinkingText, setDisplayedThinkingText] = useState("");
  const [animationKey, setAnimationKey] = useState(0);
  const lottieRef = useRef<any>(null);

  // Используем переданный текст или дефолтный
  const textToDisplay = thinkingText || mockThinkingText;

  React.useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch(getAssetPath("animation/neuronium.json"));
        const data = await response.json();
        setAnimationData(data);
        // Force re-render after loading to ensure animation plays
        setAnimationKey((prev) => prev + 1);
      } catch (error) {
        console.error("Failed to load Neuronium animation:", error);
      }
    };

    if (!animationData) {
      loadAnimation();
    }
  }, [getAssetPath, animationData]);

  // Управляем seamless loop - играем только кадры 0-108, пропускаем проблемные кадры
  useEffect(() => {
    if (!lottieRef.current || !animationData) return;

    const animationInstance = (lottieRef.current as any)?.anim;
    if (!animationInstance) return;

    const handleEnterFrame = () => {
      const currentFrame = animationInstance.currentFrame;
      // Когда достигаем кадра 108, плавно переходим к 0 для бесшовного цикла
      if (currentFrame >= 108) {
        animationInstance.goToAndPlay(0, true);
      }
    };

    animationInstance.addEventListener("enterFrame", handleEnterFrame);

    // Запускаем воспроизведение с начала
    setTimeout(() => {
      if (animationInstance) {
        animationInstance.goToAndPlay(0, true);
      }
    }, 100);

    return () => {
      animationInstance.removeEventListener("enterFrame", handleEnterFrame);
    };
  }, [animationData, animationKey]);

  // Animate thinking text character by character (like Claude web)
  React.useEffect(() => {
    if (!isThinking && !hasCompleted) {
      setDisplayedThinkingText("");
      return;
    }

    // Если уже завершено, показываем полный текст сразу
    if (!isThinking && hasCompleted) {
      setDisplayedThinkingText(textToDisplay);
      return;
    }

    // Если думаем, анимируем появление текста
    if (isThinking) {
      setDisplayedThinkingText(""); // Сбрасываем текст перед началом анимации
      let currentIndex = 0;
      let retryCount = 0;
      const maxRetries = 3;

      const animateText = () => {
        const interval = setInterval(() => {
          if (currentIndex < textToDisplay.length) {
            currentIndex++;
            setDisplayedThinkingText(textToDisplay.slice(0, currentIndex));
          } else {
            clearInterval(interval);
          }
        }, 30); // 30ms на символ для реалистичного эффекта печати

        // Проверяем через 5 секунд, не зависла ли анимация
        const checkTimeout = setTimeout(() => {
          if (
            currentIndex < textToDisplay.length / 2 &&
            retryCount < maxRetries
          ) {
            clearInterval(interval);
            currentIndex = 0;
            retryCount++;
            setDisplayedThinkingText("");
            animateText(); // Перезапускаем анимацию
          }
        }, 5000);

        return () => {
          clearInterval(interval);
          clearTimeout(checkTimeout);
        };
      };

      return animateText();
    }
  }, [isThinking, hasCompleted, textToDisplay]); // Добавили textToDisplay в зависимости

  // Показывать когда идет процесс размышления ИЛИ когда он завершен
  if (!isThinking && !hasCompleted) return null;

  return (
    <Box
      px={{ base: "16px", md: "22px" }}
      py={{ base: "12px", md: "16px" }}
      borderRadius="12px"
    >
      <Flex
        align="center"
        gap={{ base: "8px", md: "10px" }}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        {/* Neuronium Avatar with Animation */}
        <Box
          width={{ base: "60px", md: "100px" }}
          height={{ base: "60px", md: "100px" }}
          borderRadius="8px"
          overflow="hidden"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          sx={{
            // Fallback CSS animation for Android
            "@keyframes lottieRotate": {
              "0%": { transform: "rotate(0deg) scale(1)" },
              "50%": { transform: "rotate(180deg) scale(1.05)" },
              "100%": { transform: "rotate(360deg) scale(1)" },
            },
            "& > div": isThinking
              ? {
                  animation: "lottieRotate 3s ease-in-out infinite",
                }
              : {},
          }}
        >
          {animationData ? (
            <Lottie
              key={`lottie-${animationKey}`}
              ref={lottieRef}
              animationData={animationData}
              play={true}
              loop={false}
              speed={1}
              rendererSettings={{
                preserveAspectRatio: "xMidYMid slice",
                progressiveLoad: false,
                hideOnTransparent: true,
              }}
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            />
          ) : (
            <Box
              width="36px"
              height="36px"
              bg="purple.500"
              borderRadius="50%"
            />
          )}
        </Box>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          bg="rgba(255, 255, 255, 0.1)"
          color="white"
          borderRadius="100px"
          px={{ base: "12px", md: "10px" }}
          py={{ base: "8px", md: "7px" }}
          h={{ base: "auto", md: "32px" }}
          minH={{ base: "32px", md: "32px" }}
          fontSize={{ base: "11px", md: "12px" }}
          fontWeight="400"
          letterSpacing="-0.132px"
          whiteSpace={{ base: "normal", md: "nowrap" }}
          textAlign="left"
          _hover={{
            bg: "rgba(255, 255, 255, 0.15)",
          }}
          _active={{
            bg: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <Text
            mr="5px"
            fontSize={{ base: "11px", md: "12px" }}
            display={{ base: "block", md: "inline" }}
            lineHeight={{ base: "14px", md: "normal" }}
          >
            {isExpanded ? (
              <>
                <Text as="span" display={{ base: "block", md: "inline" }}>
                  Скрыть процесс
                </Text>
                <Text as="span" display={{ base: "block", md: "inline" }}>
                  {" "}
                  размышления
                </Text>
              </>
            ) : (
              <>
                <Text as="span" display={{ base: "block", md: "inline" }}>
                  Показать процесс
                </Text>
                <Text as="span" display={{ base: "block", md: "inline" }}>
                  {" "}
                  размышления
                </Text>
              </>
            )}
          </Text>
          <ChevronDownIcon
            w="16px"
            h="16px"
            transform={isExpanded ? "rotate(180deg)" : "rotate(0deg)"}
            transition="transform 0.2s"
            flexShrink={0}
          />
        </Button>
      </Flex>

      {/* Expanded Thinking Text - показываем только если развернуто */}
      {isExpanded && (
        <Box
          mt="8px"
          bg="rgba(255, 255, 255, 0.08)"
          borderRadius="12px"
          p="16px"
          w="100%"
        >
          <Box
            sx={{
              "& p": {
                fontSize: "14px",
                color: "white",
                fontWeight: "400",
                lineHeight: "1.6",
                marginBottom: "12px",
                opacity: 0.9,
                "&:last-child": {
                  marginBottom: 0,
                },
              },
              "& h2": {
                fontSize: "16px",
                color: "white",
                fontWeight: "600",
                marginTop: "16px",
                marginBottom: "8px",
                opacity: 0.95,
              },
              "& strong": {
                color: "purple.300",
                fontWeight: "600",
              },
              "& ul, & ol": {
                paddingLeft: "20px",
                marginBottom: "12px",
              },
              "& li": {
                fontSize: "14px",
                color: "white",
                opacity: 0.9,
                marginBottom: "4px",
              },
              "& code": {
                backgroundColor: "rgba(139, 92, 246, 0.2)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "13px",
                color: "purple.200",
              },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayedThinkingText}
            </ReactMarkdown>
            {isThinking && (
              <Text
                as="span"
                color="purple.300"
                fontSize="14px"
                sx={{
                  animation: "blink 1s infinite",
                  "@keyframes blink": {
                    "0%, 50%": { opacity: 1 },
                    "51%, 100%": { opacity: 0 },
                  },
                }}
              >
                |
              </Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ThinkingProcess;
