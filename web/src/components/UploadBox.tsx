import { Box, Icon, Text, useToast, BoxProps, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";

interface UploadBoxProps extends Omit<BoxProps, "onChange"> {
  isUploading?: boolean;
  files: File[];
  setFiles: (files: File[]) => void;
}

const UploadBox = ({ files, setFiles, isUploading, ...props }: UploadBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    const handleDropFile = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isUploading && e.dataTransfer && e.dataTransfer.items) {
        const files = [];

        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i];

          if (item.kind === "file") {
            const file = item.getAsFile();

            if (file) {
              files.push(file);
            }
          }
        }

        _setFiles(files);
      }
    };

    const ref = boxRef.current;
    ref?.addEventListener("dragover", e => e.preventDefault(), false);
    ref?.addEventListener("drop", handleDropFile, false);

    return () => {
      ref?.removeEventListener("dragover", e => e.preventDefault(), false);
      ref?.removeEventListener("drop", handleDropFile, false);
    };
  });

  const _setFiles = (files: File[]) => {
    const availableFiles = [];

    for (const file of files) {
      if (file && file.type.startsWith("image/")) {
        availableFiles.push(file);
      } else {
        toast({
          title: "不支援的檔案格式",
          description: "請選擇圖片檔案",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    setFiles(availableFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      _setFiles(Array.from(files));
    }
  };

  return (
    <Box {...props}>
      <input
        type="file"
        multiple
        accept="image/*"
        ref={uploadRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Box
        borderRadius="3xl"
        border="1px"
        borderColor="chakra-border-color"
        p={4}
        minH={40}
        textColor={files.length ? "InfoText" : "GrayText"}
        _hover={{ textColor: "InfoText", cursor: "pointer" }}
        onClick={() => uploadRef.current?.click()}
        ref={boxRef}
      >
        <Box textAlign="center">
          {isUploading ? (
            <Spinner as={Icon} w={12} h={12} speed="1.5s" thickness="4px" m={5} />
          ) : (
            <Icon as={AiOutlineCloudUpload} w={20} h={20} />
          )}
          {files.length ? (
            <Text>
              共 {files.length} 個檔案
              <br />
              {files.map(file => file.name).join(", ")}
            </Text>
          ) : (
            <Text>上傳檔案</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UploadBox;
