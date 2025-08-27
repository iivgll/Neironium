'use client';
import React from 'react';
import Card from '@/components/card/Card';
import { COLORS } from '@/theme/colors';
import ReactMarkdown from 'react-markdown';

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
