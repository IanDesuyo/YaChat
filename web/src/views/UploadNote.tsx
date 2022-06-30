import { Box, Button, Container, Divider, FormControl, FormLabel, Input, Text, VStack } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UploadBox from "../components/UploadBox";
import { ApiContext } from "../provider/ApiProvider";

const UploadNoteView = () => {
  const api = useContext(ApiContext);
  const { lessonId } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (lessonId?.length !== 24) {
      return;
    }
  }, [lessonId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    e.stopPropagation();

    if (lessonId && files.length) {
      const { noteId, uploadUrls } = await api.createNote(lessonId, {
        files: files.map(file => ({ size: file.size, name: file.name })),
      });

      if (noteId && uploadUrls) {
        uploadUrls.forEach(async (url, index) => {
          const file = files[index];

          const res = await fetch(url, {
            method: "PUT",
            body: file,
          }).then(res => res.json());

          if (res.success) {
            console.log(file, "uploaded");
          }
        });
      }
    }
  };

  return (
    <Container maxW="container.md" mt={10}>
      <Text fontSize="4xl">上傳筆記</Text>
      <Divider my={6} />
      <Box>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel htmlFor="nickname">暱稱</FormLabel>
              <Input id="nickname" type="nickname" isRequired />
            </FormControl>
            <UploadBox files={files} setFiles={setFiles} w="100%" isUploading={isLoading} />
          </VStack>
          <Button mt={6} type="submit" w="100%" isLoading={isLoading}>
            上傳
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default UploadNoteView;
