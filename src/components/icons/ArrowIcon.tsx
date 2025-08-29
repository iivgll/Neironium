'use client';
import React from 'react';
import { Icon, IconProps } from '@chakra-ui/react';

interface ArrowIconProps extends IconProps {
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ArrowIcon: React.FC<ArrowIconProps> = ({
  direction = 'down',
  color = '#8a8b8c',
  ...props
}) => {
  const rotationMap = {
    down: 0,
    up: 180,
    right: -90,
    left: 90,
  };

  return (
    <Icon
      viewBox="0 0 16 16"
      fill="none"
      transform={`rotate(${rotationMap[direction]}deg)`}
      transition="transform 0.2s"
      {...props}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
};
