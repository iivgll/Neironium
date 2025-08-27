'use client';
import React from 'react';
import Card from '@/components/card/Card';
import { COLORS } from '@/theme/colors';

// Use require for react-markdown to avoid ESM/CJS issues
const ReactMarkdown = require('react-markdown');

interface MessageBoxProps {
  output: string;
}

const MessageBox = React.memo<MessageBoxProps>(({ output }) => {
  const textColor = COLORS.TEXT_PRIMARY;
  
  return (
    <Card
      display={output ? 'flex' : 'none'}
      px="22px !important"
      pl="22px !important"
      color={textColor}
      minH="450px"
      fontSize={{ base: 'sm', md: 'md' }}
      lineHeight={{ base: '24px', md: '26px' }}
      fontWeight="500"
    >
      <ReactMarkdown className="font-medium">
        {output ? output : ''}
      </ReactMarkdown>
    </Card>
  );
});

MessageBox.displayName = 'MessageBox';

export default MessageBox;
