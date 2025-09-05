'use client';
import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Code,
  Avatar,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
  Link,
} from '@chakra-ui/react';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useTelegram } from '@/contexts/TelegramContext';

export default function TelegramDebugPanel() {
  const { user, isLoading, isTelegramEnvironment, isUnauthorized, displayName } = useTelegram();
  const toast = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get Telegram WebApp object if available
  const telegramWebApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  const handleCopy = useCallback(async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      toast({
        title: 'Скопировано',
        description: `${fieldName} скопирован в буфер обмена`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать в буфер обмена',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const CopyableValue = ({ label, value, fieldKey }: { label: string; value: string | number; fieldKey: string }) => (
    <Tr>
      <Td fontWeight="medium" color="gray.300" fontSize="sm">
        {label}
      </Td>
      <Td>
        <HStack>
          <Code
            colorScheme="gray"
            bg="rgba(255, 255, 255, 0.05)"
            color="white"
            fontSize="sm"
            p="2"
            borderRadius="md"
            maxW="300px"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {String(value)}
          </Code>
          <IconButton
            aria-label={`Скопировать ${label}`}
            icon={<CopyIcon />}
            size="sm"
            variant="ghost"
            colorScheme={copiedField === fieldKey ? 'green' : 'gray'}
            onClick={() => handleCopy(String(value), label)}
          />
        </HStack>
      </Td>
    </Tr>
  );

  if (isLoading) {
    return (
      <Box maxW="800px" mx="auto">
        <Card bg="rgba(255, 255, 255, 0.05)" borderColor="rgba(255, 255, 255, 0.1)">
          <CardBody>
            <Text color="white" textAlign="center">
              Загрузка данных Telegram...
            </Text>
          </CardBody>
        </Card>
      </Box>
    );
  }

  if (isUnauthorized || !isTelegramEnvironment) {
    return (
      <Box maxW="800px" mx="auto">
        <Alert status="warning" bg="rgba(255, 193, 7, 0.1)" borderColor="rgba(255, 193, 7, 0.3)">
          <AlertIcon color="yellow.400" />
          <Box>
            <AlertTitle color="yellow.200">Не в среде Telegram!</AlertTitle>
            <AlertDescription color="yellow.100">
              {process.env.NODE_ENV === 'development' 
                ? 'В режиме разработки используются мокированные данные для тестирования.'
                : 'Эта страница доступна только при запуске из Telegram Web App.'}
            </AlertDescription>
          </Box>
        </Alert>

        {process.env.NODE_ENV === 'development' && (
          <Card mt="6" bg="rgba(255, 255, 255, 0.05)" borderColor="rgba(255, 255, 255, 0.1)">
            <CardHeader>
              <Heading size="md" color="white">
                Мокированные данные для разработки
              </Heading>
            </CardHeader>
            <CardBody>
              <Text color="gray.300" mb="4">
                Отображаем тестовые данные для разработчика:
              </Text>
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Tbody>
                    <CopyableValue label="ID пользователя" value="123456789" fieldKey="dev_user_id" />
                    <CopyableValue label="Имя" value="Разработчик" fieldKey="dev_first_name" />
                    <CopyableValue label="Фамилия" value="Тестовый" fieldKey="dev_last_name" />
                    <CopyableValue label="Username" value="dev_user" fieldKey="dev_username" />
                    <CopyableValue label="Язык" value="ru" fieldKey="dev_language" />
                    <CopyableValue label="Статус" value="Development Mode" fieldKey="dev_status" />
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        )}
      </Box>
    );
  }

  return (
    <VStack spacing="6" maxW="800px" mx="auto">
      {/* Connection Status */}
      <Card w="100%" bg="rgba(255, 255, 255, 0.05)" borderColor="rgba(255, 255, 255, 0.1)">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="white">
              Статус подключения Telegram
            </Heading>
            <Badge
              colorScheme={isTelegramEnvironment ? 'green' : 'red'}
              variant="subtle"
              px="3"
              py="1"
              borderRadius="full"
            >
              {isTelegramEnvironment ? 'Подключено' : 'Не подключено'}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <Text color="gray.300">
            Отображаемое имя: <Text as="span" color="white" fontWeight="medium">{displayName}</Text>
          </Text>
        </CardBody>
      </Card>

      {/* User Information */}
      {user && (
        <Card w="100%" bg="rgba(255, 255, 255, 0.05)" borderColor="rgba(255, 255, 255, 0.1)">
          <CardHeader>
            <HStack>
              {user.photo_url && (
                <Avatar src={user.photo_url} size="md" />
              )}
              <Box>
                <Heading size="md" color="white">
                  Информация о пользователе
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  Данные, полученные от Telegram
                </Text>
              </Box>
            </HStack>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table size="sm" variant="simple">
                <Tbody>
                  <CopyableValue label="ID пользователя" value={user.id} fieldKey="user_id" />
                  <CopyableValue label="Имя" value={user.first_name} fieldKey="first_name" />
                  {user.last_name && (
                    <CopyableValue label="Фамилия" value={user.last_name} fieldKey="last_name" />
                  )}
                  {user.username && (
                    <CopyableValue label="Username" value={`@${user.username}`} fieldKey="username" />
                  )}
                  {user.language_code && (
                    <CopyableValue label="Язык" value={user.language_code} fieldKey="language_code" />
                  )}
                  {user.is_premium !== undefined && (
                    <Tr>
                      <Td fontWeight="medium" color="gray.300" fontSize="sm">
                        Premium статус
                      </Td>
                      <Td>
                        <Badge colorScheme={user.is_premium ? 'gold' : 'gray'} variant="subtle">
                          {user.is_premium ? 'Premium' : 'Regular'}
                        </Badge>
                      </Td>
                    </Tr>
                  )}
                  {user.photo_url && (
                    <Tr>
                      <Td fontWeight="medium" color="gray.300" fontSize="sm">
                        Фото профиля
                      </Td>
                      <Td>
                        <HStack>
                          <Link href={user.photo_url} isExternal color="blue.300">
                            <HStack>
                              <Text fontSize="sm">Открыть изображение</Text>
                              <ExternalLinkIcon boxSize="3" />
                            </HStack>
                          </Link>
                          <IconButton
                            aria-label="Скопировать ссылку на фото"
                            icon={<CopyIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme={copiedField === 'photo_url' ? 'green' : 'gray'}
                            onClick={() => handleCopy(user.photo_url!, 'Ссылка на фото')}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {/* Telegram WebApp Data */}
      {telegramWebApp && (
        <Card w="100%" bg="rgba(255, 255, 255, 0.05)" borderColor="rgba(255, 255, 255, 0.1)">
          <CardHeader>
            <Heading size="md" color="white">
              Технические данные WebApp
            </Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table size="sm" variant="simple">
                <Tbody>
                  <CopyableValue label="Версия" value={telegramWebApp.version} fieldKey="version" />
                  <CopyableValue label="Платформа" value={telegramWebApp.platform} fieldKey="platform" />
                  <CopyableValue 
                    label="Цветовая схема" 
                    value={telegramWebApp.colorScheme} 
                    fieldKey="color_scheme" 
                  />
                  <CopyableValue 
                    label="Высота viewport" 
                    value={telegramWebApp.viewportHeight} 
                    fieldKey="viewport_height" 
                  />
                  <CopyableValue 
                    label="Стабильная высота" 
                    value={telegramWebApp.viewportStableHeight} 
                    fieldKey="viewport_stable_height" 
                  />
                  <Tr>
                    <Td fontWeight="medium" color="gray.300" fontSize="sm">
                      Развернуто
                    </Td>
                    <Td>
                      <Badge colorScheme={telegramWebApp.isExpanded ? 'green' : 'gray'} variant="subtle">
                        {telegramWebApp.isExpanded ? 'Да' : 'Нет'}
                      </Badge>
                    </Td>
                  </Tr>
                  <CopyableValue 
                    label="Цвет заголовка" 
                    value={telegramWebApp.headerColor} 
                    fieldKey="header_color" 
                  />
                  <CopyableValue 
                    label="Цвет фона" 
                    value={telegramWebApp.backgroundColor} 
                    fieldKey="bg_color" 
                  />
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {/* Init Data */}
      {telegramWebApp?.initDataUnsafe && (
        <Card w="100%" bg="rgba(255, 255, 255, 0.05)" borderColor="rgba(255, 255, 255, 0.1)">
          <CardHeader>
            <Heading size="md" color="white">
              Данные авторизации
            </Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table size="sm" variant="simple">
                <Tbody>
                  {telegramWebApp.initDataUnsafe.query_id && (
                    <CopyableValue 
                      label="Query ID" 
                      value={telegramWebApp.initDataUnsafe.query_id} 
                      fieldKey="query_id" 
                    />
                  )}
                  <CopyableValue 
                    label="Auth Date" 
                    value={new Date(telegramWebApp.initDataUnsafe.auth_date * 1000).toLocaleString()} 
                    fieldKey="auth_date" 
                  />
                  <CopyableValue 
                    label="Hash" 
                    value={telegramWebApp.initDataUnsafe.hash} 
                    fieldKey="hash" 
                  />
                  {telegramWebApp.initDataUnsafe.start_param && (
                    <CopyableValue 
                      label="Start Param" 
                      value={telegramWebApp.initDataUnsafe.start_param} 
                      fieldKey="start_param" 
                    />
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {/* Raw Data */}
      {telegramWebApp?.initData && (
        <Card w="100%" bg="rgba(255, 255, 255, 0.05)" borderColor="rgba(255, 255, 255, 0.1)">
          <CardHeader>
            <Heading size="md" color="white">
              Сырые данные инициализации
            </Heading>
          </CardHeader>
          <CardBody>
            <HStack align="start">
              <Code
                colorScheme="gray"
                bg="rgba(0, 0, 0, 0.3)"
                color="gray.200"
                fontSize="xs"
                p="4"
                borderRadius="md"
                flex="1"
                whiteSpace="pre-wrap"
                wordBreak="break-all"
                maxH="200px"
                overflowY="auto"
              >
                {telegramWebApp.initData}
              </Code>
              <IconButton
                aria-label="Скопировать сырые данные"
                icon={<CopyIcon />}
                size="sm"
                variant="ghost"
                colorScheme={copiedField === 'raw_data' ? 'green' : 'gray'}
                onClick={() => handleCopy(telegramWebApp.initData, 'Сырые данные')}
                alignSelf="flex-start"
              />
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* Theme Params */}
      {telegramWebApp?.themeParams && Object.keys(telegramWebApp.themeParams).length > 0 && (
        <Card w="100%" bg="rgba(255, 255, 255, 0.05)" borderColor="rgba(255, 255, 255, 0.1)">
          <CardHeader>
            <Heading size="md" color="white">
              Параметры темы
            </Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table size="sm" variant="simple">
                <Tbody>
                  {Object.entries(telegramWebApp.themeParams)
                    .filter(([_, value]) => value !== undefined)
                    .map(([key, value]) => (
                      <CopyableValue 
                        key={key}
                        label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                        value={value as string} 
                        fieldKey={`theme_${key}`} 
                      />
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}