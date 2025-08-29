'use client';
import React, { useState, useContext } from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  IconButton,
  VStack,
  HStack,
  Button,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { SidebarContext } from '@/contexts/SidebarContext';
import { IRoute } from '@/types/navigation';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { MdMoreHoriz, MdClose } from 'react-icons/md';
import { IoMenuOutline } from 'react-icons/io5';
import Image from 'next/image';

interface NeuroniumSidebarProps {
  routes: IRoute[];
  chats?: Array<{
    id: string;
    title: string;
    date?: string;
  }>;
}

export default function NeuroniumSidebar({
  routes,
  chats = [],
}: NeuroniumSidebarProps) {
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  // Dark theme colors only
  const bgColor = '#1e1e1e'; // neuronium.background.primary
  const borderColor = '#343434'; // neuronium.border.primary
  const textPrimary = '#ffffff'; // neuronium.text.primary
  const textSecondary = '#8a8b8c'; // neuronium.text.secondary
  const hoverBg = 'rgba(255, 255, 255, 0.05)'; // neuronium.background.hover
  const activeBg = 'rgba(255, 255, 255, 0.1)'; // neuronium.background.active

  const sidebarWidth = isCollapsed ? '68px' : '300px';

  return (
    <Box
      display={{ base: 'none', lg: 'block' }}
      position="fixed"
      left="0"
      top="0"
      h={isCollapsed ? '60px' : '100vh'}
      w={sidebarWidth}
      bg={isCollapsed ? 'transparent' : bgColor}
      borderRight={isCollapsed ? 'none' : '1px solid'}
      borderColor={borderColor}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      zIndex={100}
      boxShadow={isCollapsed ? 'none' : '11px 7px 40px 0px rgba(0,0,0,0.2)'}
    >
      <Flex
        direction="column"
        h="100%"
        p={isCollapsed ? '12px' : '20px'}
        justify={isCollapsed ? 'center' : 'flex-start'}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          mb={isCollapsed ? '0' : '20px'}
          minH="36px"
        >
          {!isCollapsed ? (
            <>
              <Flex align="center">
                <Box
                  w="36px"
                  h="36px"
                  borderRadius="4px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mr="12px"
                >
                  <Text
                    fontSize="24px"
                    fontWeight="bold"
                    color="white"
                    fontFamily="'Gantari', sans-serif"
                  >
                    Nr
                  </Text>
                </Box>
              </Flex>
              <IconButton
                aria-label="Collapse sidebar"
                icon={
                  <Image
                    src="/icons/button.svg"
                    alt="Close sidebar"
                    width={24}
                    height={24}
                  />
                }
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed?.(!isCollapsed)}
                color={textPrimary}
                _hover={{ bg: hoverBg }}
              />
            </>
          ) : (
            <HStack spacing="8px" justify="center">
              <Tooltip label="Развернуть меню" placement="right">
                <IconButton
                  aria-label="Expand sidebar"
                  icon={
                    <Image
                      src="/icons/cancel_button.svg"
                      alt="Open sidebar"
                      width={40}
                      height={40}
                    />
                  }
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsCollapsed?.(!isCollapsed)}
                  color={textPrimary}
                  _hover={{ bg: hoverBg }}
                  bg={bgColor}
                  borderRadius="8px"
                  boxShadow="2px 2px 8px rgba(0,0,0,0.1)"
                />
              </Tooltip>

              <Tooltip label="Создать новый чат" placement="right">
                <IconButton
                  aria-label="New chat"
                  icon={
                    <Image
                      src="/icons/edit.svg"
                      alt="New chat"
                      width={22}
                      height={22}
                    />
                  }
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    // Здесь можно добавить логику создания нового чата
                    console.log('Create new chat');
                  }}
                  color={textPrimary}
                  _hover={{ bg: hoverBg }}
                  bg={bgColor}
                  borderRadius="8px"
                  boxShadow="2px 2px 8px rgba(0,0,0,0.1)"
                />
              </Tooltip>
            </HStack>
          )}
        </Flex>

        {/* Action Buttons - скрыть в collapsed состоянии */}
        {!isCollapsed && (
          <VStack spacing="8px" mb="24px">
            <Button
              w="100%"
              h="50px"
              bg="transparent"
              color={textPrimary}
              _hover={{ bg: hoverBg }}
              justifyContent="flex-start"
              px="12px"
              borderRadius="100px"
              leftIcon={
                <Image
                  src="/icons/edit.svg"
                  alt="New chat"
                  width={24}
                  height={24}
                />
              }
            >
              <Text fontSize="16px" fontWeight="600">
                Новый чат
              </Text>
            </Button>

            <Button
              w="100%"
              h="50px"
              bg="transparent"
              color={textPrimary}
              _hover={{ bg: hoverBg }}
              justifyContent="flex-start"
              px="12px"
              borderRadius="100px"
              leftIcon={
                <Image
                  src="icons/magnifer.svg"
                  alt="New chat"
                  width={24}
                  height={24}
                />
              }
            >
              <Text fontSize="16px" fontWeight="600">
                Поиск в чатах
              </Text>
            </Button>
          </VStack>
        )}

        {/* Chats Section */}
        {!isCollapsed && (
          <Box flex="1" overflowY="auto">
            <Text
              fontSize="12px"
              fontWeight="400"
              color={textSecondary}
              textTransform="uppercase"
              letterSpacing="0.4px"
              mb="16px"
            >
              чаты
            </Text>

            <VStack spacing="8px" align="stretch">
              {/* Example chat items */}
              <Flex
                h="40px"
                px="10px"
                py="7px"
                bg={activeBg}
                borderRadius="10px"
                align="center"
                justify="space-between"
                cursor="pointer"
                _hover={{ bg: hoverBg }}
              >
                <Text
                  fontSize="16px"
                  color={textPrimary}
                  noOfLines={1}
                  flex="1"
                >
                  Создание статей для Хабра
                </Text>
                <HStack spacing="4px">
                  <Icon
                    as={MdMoreHoriz}
                    w="16px"
                    h="16px"
                    color={textSecondary}
                  />
                  <Icon as={MdClose} w="16px" h="16px" color={textSecondary} />
                </HStack>
              </Flex>

              {[1, 2, 3, 4].map((i) => (
                <Flex
                  key={i}
                  h="40px"
                  px="10px"
                  py="7px"
                  align="center"
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  borderRadius="10px"
                >
                  <Text fontSize="16px" color={textPrimary}>
                    Название
                  </Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        )}
      </Flex>
    </Box>
  );
}

// Mobile Responsive Sidebar
export function NeuroniumSidebarResponsive({
  routes,
  chats = [],
}: NeuroniumSidebarProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();

  // Dark theme colors only
  const bgColor = '#1e1e1e'; // neuronium.background.primary
  const borderColor = '#343434'; // neuronium.border.primary
  const textPrimary = '#ffffff'; // neuronium.text.primary
  const textSecondary = '#8a8b8c'; // neuronium.text.secondary
  const hoverBg = 'rgba(255, 255, 255, 0.05)'; // neuronium.background.hover
  const activeBg = 'rgba(255, 255, 255, 0.1)'; // neuronium.background.active
  const accentColor = '#8854f3'; // neuronium.accent.violet
  const menuColor = '#ffffff'; // Always white for dark theme

  return (
    <>
      <Flex display={{ base: 'flex', lg: 'none' }} alignItems="center">
        <IconButton
          aria-label="Open menu"
          icon={
            <Image
              src="/icons/cancel_button.svg"
              alt="Close sidebar"
              width={24}
              height={24}
            />
          }
          onClick={onOpen}
          variant="ghost"
          color={menuColor}
          size="md"
        />
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent
          bg={bgColor}
          maxW="300px"
          borderRight="1px solid"
          borderColor={borderColor}
        >
          <DrawerCloseButton
            color={textPrimary}
            position="absolute"
            top="20px"
            right="20px"
            as={IconButton}
            icon={
              <Image
                src="/icons/button.svg"
                alt="Close sidebar"
                width={24}
                height={24}
              />
            }
          />
          <DrawerBody p="20px">
            {/* Header */}
            <Flex align="center" mb="20px">
              <Box
                w="36px"
                h="36px"
                borderRadius="4px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr="12px"
              >
                <Text
                  fontSize="24px"
                  fontWeight="bold"
                  color="white"
                  fontFamily="'Gantari', sans-serif"
                >
                  Nr
                </Text>
              </Box>
            </Flex>

            {/* Action Buttons */}
            <VStack spacing="8px" mb="24px">
              <Button
                w="100%"
                h="50px"
                bg="transparent"
                color={textPrimary}
                _hover={{ bg: hoverBg }}
                justifyContent="flex-start"
                px="12px"
                borderRadius="100px"
                leftIcon={
                  <Image
                    src="/icons/edit.svg"
                    alt="New chat"
                    width={24}
                    height={24}
                  />
                }
              >
                <Text fontSize="16px" fontWeight="600">
                  Новый чат
                </Text>
              </Button>

              <Button
                w="100%"
                h="50px"
                bg="transparent"
                color={textPrimary}
                _hover={{ bg: hoverBg }}
                justifyContent="flex-start"
                px="12px"
                borderRadius="100px"
                leftIcon={
                  <Image
                    src="/icons/magnifer.svg"
                    alt="Search"
                    width={24}
                    height={24}
                  />
                }
              >
                <Text fontSize="16px" fontWeight="600">
                  Поиск в чатах
                </Text>
              </Button>
            </VStack>

            {/* Chats Section */}
            <Box flex="1">
              <Text
                fontSize="12px"
                fontWeight="400"
                color={textSecondary}
                textTransform="uppercase"
                letterSpacing="0.4px"
                mb="16px"
              >
                чаты
              </Text>

              <VStack spacing="8px" align="stretch">
                <Flex
                  h="40px"
                  px="10px"
                  py="7px"
                  bg={activeBg}
                  borderRadius="10px"
                  align="center"
                  justify="space-between"
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                >
                  <Text
                    fontSize="16px"
                    color={textPrimary}
                    noOfLines={1}
                    flex="1"
                  >
                    Создание статей для Хабра
                  </Text>
                  <HStack spacing="4px">
                    <Icon
                      as={MdMoreHoriz}
                      w="16px"
                      h="16px"
                      color={textSecondary}
                    />
                    <Icon
                      as={MdClose}
                      w="16px"
                      h="16px"
                      color={textSecondary}
                    />
                  </HStack>
                </Flex>

                {[1, 2, 3, 4].map((i) => (
                  <Flex
                    key={i}
                    h="40px"
                    px="10px"
                    py="7px"
                    align="center"
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    borderRadius="10px"
                  >
                    <Text fontSize="16px" color={textPrimary}>
                      Название
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
