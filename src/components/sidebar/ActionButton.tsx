'use client';
import React from 'react';
import { Button, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { useAssetPath } from '@/hooks/useAssetPath';

interface ActionButtonProps {
  icon: string;
  iconAlt: string;
  label: string;
  onClick?: () => void;
  theme: {
    textPrimary: string;
    hoverBg: string;
  };
}

export const ActionButton = React.memo<ActionButtonProps>(
  ({ icon, iconAlt, label, onClick, theme }) => {
    const { getAssetPath } = useAssetPath();
    
    return (
      <Button
        w="100%"
        h="50px"
        bg="transparent"
        color={theme.textPrimary}
        _hover={{ bg: theme.hoverBg }}
        justifyContent="flex-start"
        px="12px"
        borderRadius="100px"
        leftIcon={<Image src={getAssetPath(icon)} alt={iconAlt} width={24} height={24} />}
        onClick={onClick}
      >
        <Text fontSize="16px" fontWeight="600">
          {label}
        </Text>
      </Button>
    );
  },
);

ActionButton.displayName = 'ActionButton';
