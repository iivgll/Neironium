'use client';
import React from 'react';
import { Box, Flex, Text, IconButton, Image } from '@chakra-ui/react';
import { MdClose, MdInsertDriveFile, MdPictureAsPdf, MdImage } from 'react-icons/md';
import { FaFileWord, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa';
import { AttachedFile, formatFileSize } from '@/types/file';
import { COLORS } from '@/theme/colors';

interface FileAttachmentProps {
  file: AttachedFile;
  onRemove: (id: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return MdPictureAsPdf;
  if (type.includes('word') || type.includes('document')) return FaFileWord;
  if (type.includes('excel') || type.includes('spreadsheet')) return FaFileExcel;
  if (type.includes('powerpoint') || type.includes('presentation')) return FaFilePowerpoint;
  if (type.startsWith('image/')) return MdImage;
  return MdInsertDriveFile;
};

export function FileAttachment({ file, onRemove }: FileAttachmentProps) {
  const Icon = getFileIcon(file.type);
  const isImage = file.type.startsWith('image/');
  
  return (
    <Box
      position="relative"
      borderRadius="12px"
      overflow="hidden"
      bg={COLORS.BG_SECONDARY}
      border={`1px solid ${COLORS.BORDER_PRIMARY}`}
      transition="all 0.2s"
      _hover={{
        borderColor: COLORS.ACCENT_VIOLET,
        transform: 'translateY(-2px)',
      }}
    >
      {isImage && file.preview ? (
        <Box position="relative" w="100px" h="100px">
          <Image
            src={file.preview}
            alt={file.name}
            w="100%"
            h="100%"
            objectFit="cover"
          />
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            bg="rgba(0, 0, 0, 0.7)"
            p="4px"
          >
            <Text
              fontSize="10px"
              color="white"
              noOfLines={1}
              title={file.name}
            >
              {file.name}
            </Text>
          </Box>
        </Box>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p="12px"
          w="100px"
          h="100px"
        >
          <Icon
            size={32}
            color={COLORS.ACCENT_VIOLET}
            style={{ marginBottom: '8px' }}
          />
          <Text
            fontSize="11px"
            color={COLORS.TEXT_SECONDARY}
            noOfLines={1}
            w="100%"
            textAlign="center"
            title={file.name}
          >
            {file.name}
          </Text>
          <Text
            fontSize="10px"
            color={COLORS.TEXT_TERTIARY}
            mt="2px"
          >
            {formatFileSize(file.size)}
          </Text>
        </Flex>
      )}
      
      <IconButton
        aria-label="Remove file"
        icon={<MdClose />}
        size="xs"
        position="absolute"
        top="4px"
        right="4px"
        bg="rgba(0, 0, 0, 0.6)"
        color="white"
        _hover={{
          bg: 'rgba(0, 0, 0, 0.8)',
        }}
        onClick={() => onRemove(file.id)}
      />
    </Box>
  );
}