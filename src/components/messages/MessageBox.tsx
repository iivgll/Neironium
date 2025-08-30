'use client';
import React from 'react';
import Card from '@/components/card/Card';
import { COLORS } from '@/theme/colors';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box } from '@chakra-ui/react';

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
      <Box
        sx={{
          '& p': {
            marginBottom: '16px',
            lineHeight: '1.6',
            '&:last-child': {
              marginBottom: 0
            }
          },
          '& h1': {
            fontSize: '24px',
            fontWeight: '700',
            marginTop: '24px',
            marginBottom: '16px',
            '&:first-of-type': {
              marginTop: 0
            }
          },
          '& h2': {
            fontSize: '20px',
            fontWeight: '600',
            marginTop: '20px',
            marginBottom: '12px'
          },
          '& h3': {
            fontSize: '18px',
            fontWeight: '600',
            marginTop: '16px',
            marginBottom: '8px'
          },
          '& strong': {
            fontWeight: '600',
            color: COLORS.TEXT_PRIMARY
          },
          '& ul, & ol': {
            paddingLeft: '24px',
            marginBottom: '16px'
          },
          '& li': {
            marginBottom: '8px',
            lineHeight: '1.6'
          },
          '& code': {
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '14px',
            color: 'purple.300'
          },
          '& pre': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            marginBottom: '16px',
            '& code': {
              backgroundColor: 'transparent',
              padding: 0
            }
          },
          '& blockquote': {
            borderLeft: '4px solid',
            borderLeftColor: 'purple.400',
            paddingLeft: '16px',
            marginLeft: 0,
            marginBottom: '16px',
            fontStyle: 'italic',
            opacity: 0.9
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            marginTop: '16px',
            marginBottom: '16px'
          },
          '& a': {
            color: 'purple.400',
            textDecoration: 'underline',
            '&:hover': {
              color: 'purple.300'
            }
          },
          '& hr': {
            border: 'none',
            borderTop: '1px solid',
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            marginTop: '24px',
            marginBottom: '24px'
          },
          '& table': {
            width: '100%',
            marginBottom: '16px',
            borderCollapse: 'collapse',
            '& th, & td': {
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 12px',
              textAlign: 'left'
            },
            '& th': {
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              fontWeight: '600'
            }
          }
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {output ? output : ''}
        </ReactMarkdown>
      </Box>
    </Card>
  );
});

MessageBox.displayName = 'MessageBox';

export default MessageBox;
