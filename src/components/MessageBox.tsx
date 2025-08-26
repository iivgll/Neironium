'use client';
import Card from '@/components/card/Card';
const ReactMarkdown = require('react-markdown').default || require('react-markdown');

export default function MessageBox(props: { output: string }) {
  const { output } = props;
  // Dark theme only - always white text
  const textColor = '#ffffff'; // neuronium.text.primary
  
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
  )
}
