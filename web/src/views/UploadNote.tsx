import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UploadBox from "../components/UploadBox";
import { ApiContext } from "../provider/ApiProvider";
import wordRanking from "../utils/wordRanking";

const UploadNoteView = () => {
  const api = useContext(ApiContext);
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<[string, number][]>();
  const { isOpen, onOpen } = useDisclosure();

  const onClose = () => {
    navigate(`/lesson/${lessonId}`);
  };

  useEffect(() => {
    if (lessonId?.length !== 24) {
      return;
    }
  }, [lessonId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    e.stopPropagation();

    if (!lessonId || !files.length) {
      return;
    }

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

    const interval = setInterval(async () => {
      const status = await api.getNoteStatus(lessonId, noteId);

      if (status.analyzed) {
        clearInterval(interval);

        api.getNote(lessonId, noteId).then(note => {
          const ranking = wordRanking([note]);
          setResult(ranking);
          onOpen();
        });
      }
    }, 5000);
  };

  return (
    <Container maxW="container.md" my={10}>
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>分析結果</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>您筆記中最常提到的關鍵字為</Text>
            <VStack spacing={2}>
              {result?.map(([word, count]) => (
                <Text key={word}>{word}</Text>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              關閉
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default UploadNoteView;
