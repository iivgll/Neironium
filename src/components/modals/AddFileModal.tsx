"use client";
import React, { useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Input,
  HStack,
  Icon,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { MdAdd, MdDelete, MdInsertDriveFile, MdCode, MdImage } from "react-icons/md";
import { COLORS } from "@/theme/colors";
import { FileRead } from "@/types/api";

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: number;
  files: FileRead[];
  onFilesChange: () => void;
  onFileUpload: (files: FileList) => Promise<void>;
  onFileDelete: (fileId: number) => Promise<void>;
  onUrlAdd?: (url: string) => void;
}

// Helper function to get file icon and color based on mime type
const getFileIcon = (mime: string) => {
  if (mime.startsWith("image/")) {
    return { icon: MdImage, color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" };
  }
  if (mime.includes("pdf")) {
    return { icon: MdInsertDriveFile, color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" };
  }
  if (mime.includes("code") || mime.includes("text") || mime.includes("javascript") || mime.includes("typescript")) {
    return { icon: MdCode, color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" };
  }
  return { icon: MdInsertDriveFile, color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" };
};

// Helper function to get file type label
const getFileTypeLabel = (mime: string, name: string): string => {
  if (mime.startsWith("image/")) {
    const ext = name.split(".").pop()?.toUpperCase();
    return ext || "Image";
  }
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("javascript")) return "JS";
  if (mime.includes("typescript")) return "TS";
  if (mime.includes("python")) return "Python";
  if (mime.includes("code") || mime.includes("text")) return "Code";
  const ext = name.split(".").pop()?.toUpperCase();
  return ext || "File";
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Supported file types
const SUPPORTED_FILE_TYPES = [
  // Documents
  ".pdf", ".txt", ".doc", ".docx", ".rtf", ".odt",
  // Code files
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".cs", ".php", ".rb", ".go", ".rs", ".swift",
  ".html", ".css", ".json", ".xml", ".yaml", ".yml", ".md", ".sh", ".sql",
  // Images
  ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp",
  // Spreadsheets
  ".csv", ".xls", ".xlsx", ".ods",
];

export default function AddFileModal({
  isOpen,
  onClose,
  chatId,
  files,
  onFilesChange,
  onFileUpload,
  onFileDelete,
  onUrlAdd,
}: AddFileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDropZone, setShowDropZone] = useState(false);

  const handleFileSelect = async (fileList: FileList | null) => {
    if (fileList && fileList.length > 0 && chatId) {
      setIsUploading(true);
      setUploadError(null);
      try {
        await onFileUpload(fileList);
        onFilesChange();
        // После успешной загрузки возвращаемся к списку файлов
        setShowDropZone(false);
      } catch (error) {
        console.error("File upload failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload file";

        // Check if it's an unsupported format error
        if (errorMessage.includes("Unsupported file format")) {
          setUploadError("Неподдерживаемый формат файла. Пожалуйста, загрузите документ, изображение или код файл.");
        } else {
          setUploadError(errorMessage);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDeleteFile = async (fileId: number) => {
    setDeletingFileId(fileId);
    try {
      await onFileDelete(fileId);
      onFilesChange();
    } catch (error) {
      console.error("File delete failed:", error);
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleAddUrl = () => {
    if (url.trim()) {
      onUrlAdd?.(url);
      console.log("URL added:", url);
      setUrl("");
    }
  };

  const hasFiles = files.length > 0;

  // Show drop zone when: no files OR user clicked "Add file" button
  const shouldShowDropZone = !hasFiles || showDropZone;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="#1a1a1a"
        border="none"
        borderRadius="24px"
        maxW={{ base: "90vw", md: "800px" }}
        mx="20px"
        p="0"
      >
        <ModalHeader
          color={COLORS.TEXT_PRIMARY}
          fontSize="24px"
          fontWeight="700"
          pt="32px"
          px="32px"
          pb="24px"
          pr="72px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text>Добавить файл</Text>
          {hasFiles && !showDropZone && (
            <Button
              leftIcon={<Icon as={MdAdd} w="18px" h="18px" />}
              size="sm"
              variant="ghost"
              color={COLORS.TEXT_PRIMARY}
              fontSize="14px"
              fontWeight="500"
              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              onClick={() => setShowDropZone(true)}
              isLoading={isUploading}
            >
              Добавить файл
            </Button>
          )}
          {showDropZone && (
            <Button
              size="sm"
              variant="ghost"
              color={COLORS.TEXT_SECONDARY}
              fontSize="14px"
              fontWeight="500"
              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              onClick={() => setShowDropZone(false)}
            >
              Назад к списку
            </Button>
          )}
        </ModalHeader>
        <ModalCloseButton
          color={COLORS.TEXT_SECONDARY}
          top="32px"
          right="32px"
          _hover={{ color: COLORS.TEXT_PRIMARY }}
        />

        <ModalBody px="32px" pb="32px">
          <VStack spacing="16px" align="stretch">
            {/* Error Message */}
            {uploadError && (
              <Box
                bg="rgba(245, 87, 108, 0.1)"
                border="1px solid rgba(245, 87, 108, 0.3)"
                borderRadius="12px"
                p="12px 16px"
              >
                <Text fontSize="14px" color="#f5576c">
                  {uploadError}
                </Text>
              </Box>
            )}

            {shouldShowDropZone ? (
              <>
                {/* Drop Zone */}
                <Box
                  position="relative"
                  bg="#2a2a2a"
                  borderRadius="16px"
                  p="48px"
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  border="2px dashed"
                  borderColor={isDragging ? "#6366f1" : "transparent"}
                  transition="all 0.2s"
                  _hover={{
                    bg: "#323232",
                    borderColor: "#6366f1",
                  }}
                >
                  <VStack spacing="16px">
                    {/* Plus Icon */}
                    <Box
                      w="56px"
                      h="56px"
                      borderRadius="50%"
                      bg="rgba(99, 102, 241, 0.1)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={MdAdd} w="32px" h="32px" color="#6366f1" />
                    </Box>

                    {/* Description Text */}
                    <Text
                      fontSize="14px"
                      color={COLORS.TEXT_SECONDARY}
                      lineHeight="20px"
                      maxW="400px"
                    >
                      Добавляйте документы, файлы кода, изображения и многое другое.{" "}
                      <Text as="span" fontWeight="700" color={COLORS.TEXT_PRIMARY}>
                        Neironium
                      </Text>{" "}
                      может получить доступ к их содержимому, когда вы общаетесь
                      внутри файла.
                    </Text>
                  </VStack>

                  {/* Hidden File Input */}
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    display="none"
                    accept={SUPPORTED_FILE_TYPES.join(",")}
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </Box>
              </>
            ) : hasFiles ? (
              <>
                {/* Files List */}
                <VStack spacing="8px" align="stretch">
                  {files.map((file) => {
                    const { icon, color } = getFileIcon(file.mime);
                    const typeLabel = getFileTypeLabel(file.mime, file.name);

                    return (
                      <Flex
                        key={file.id}
                        align="center"
                        bg="#2a2a2a"
                        borderRadius="12px"
                        p="16px"
                        transition="all 0.2s"
                        _hover={{ bg: "#323232" }}
                      >
                        {/* File Icon */}
                        <Box
                          w="48px"
                          h="48px"
                          borderRadius="12px"
                          background={color}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          <Icon as={icon} w="24px" h="24px" color="white" />
                        </Box>

                        {/* File Info */}
                        <Box flex="1" ml="16px" minW="0">
                          <Text
                            fontSize="14px"
                            fontWeight="500"
                            color={COLORS.TEXT_PRIMARY}
                            noOfLines={1}
                          >
                            {file.name}
                          </Text>
                          <Text fontSize="12px" color={COLORS.TEXT_SECONDARY}>
                            {typeLabel} • {formatFileSize(file.size_bytes)}
                          </Text>
                        </Box>

                        {/* Delete Button */}
                        <IconButton
                          aria-label="Удалить файл"
                          icon={<Icon as={MdDelete} w="20px" h="20px" />}
                          size="sm"
                          variant="ghost"
                          color={COLORS.TEXT_SECONDARY}
                          _hover={{ color: "#f5576c", bg: "rgba(245, 87, 108, 0.1)" }}
                          onClick={() => handleDeleteFile(file.id)}
                          isLoading={deletingFileId === file.id}
                          flexShrink={0}
                        />
                      </Flex>
                    );
                  })}
                </VStack>

              </>
            ) : null}

            {/* Divider with "или" */}
            <HStack spacing="16px" mt="8px" mb="4px">
              <Box flex="1" h="1px" bg="#343434" />
              <Text
                fontSize="14px"
                color={COLORS.TEXT_SECONDARY}
                textTransform="lowercase"
              >
                или
              </Text>
              <Box flex="1" h="1px" bg="#343434" />
            </HStack>

            {/* URL Input */}
            <HStack spacing="12px" mt="0">{/* Убираем лишний отступ сверху */}
              <Box position="relative" flex="1">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddUrl();
                    }
                  }}
                  placeholder="Введите ссылку на веб-сайт откуда я буду брать информацию"
                  bg="#2a2a2a"
                  border="none"
                  borderRadius="100px"
                  h="48px"
                  pl="16px"
                  pr="16px"
                  color={COLORS.TEXT_PRIMARY}
                  fontSize="14px"
                  _placeholder={{ color: COLORS.TEXT_SECONDARY }}
                  _focus={{
                    bg: "#323232",
                    boxShadow: "none",
                  }}
                />
              </Box>

              <Button
                bg={COLORS.TEXT_PRIMARY}
                color="#000000"
                borderRadius="100px"
                h="48px"
                px="24px"
                fontWeight="700"
                fontSize="14px"
                _hover={{ bg: "rgba(255, 255, 255, 0.9)" }}
                _active={{ bg: "rgba(255, 255, 255, 0.8)" }}
                onClick={handleAddUrl}
                isDisabled={!url.trim()}
              >
                Добавить сайт
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
