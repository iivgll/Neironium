'use client';
import React, { FC, useEffect, useState, useCallback } from 'react';
import { COLORS } from '@/theme/colors';

// Use require for react-markdown to avoid ESM/CJS issues
const ReactMarkdown = require('react-markdown');

interface Props {
  code: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export const MarkdownBlock: FC<Props> = ({
  code,
  editable = false,
  onChange = () => {},
}) => {
  const [copyText, setCopyText] = useState<string>('Copy');

  useEffect(() => {
    if (copyText === 'Copied!') {
      const timeout = setTimeout(() => {
        setCopyText('Copy');
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [copyText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyText('Copied!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [code]);

  return (
    <div className="relative">
      <button
        className="absolute right-0 top-0 z-10 rounded p-1 text-xs text-white transition-colors"
        style={{
          backgroundColor: COLORS.BG_SECONDARY,
          color: COLORS.TEXT_PRIMARY,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.BG_SECONDARY;
        }}
        onClick={handleCopy}
        type="button"
        aria-label="Copy code to clipboard"
      >
        {copyText}
      </button>

      <div 
        className="p-4 overflow-scroll rounded-md"
        style={{
          height: '500px',
          backgroundColor: COLORS.BG_SECONDARY,
          color: COLORS.TEXT_PRIMARY,
        }}
      >
        <ReactMarkdown className="font-normal">{code}</ReactMarkdown>
      </div>
    </div>
  );
};
