import {
  Skeleton,
  Text,
  Container,
  Divider,
  Wrap,
  Button,
  Icon,
  VStack,
  Flex,
  IconButton,
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Center,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ApiContext } from "../provider/ApiProvider";
import { AuthContext } from "../provider/AuthProvider";
import { LessonWithCourse } from "../types/model";
import { AiOutlineCloud, AiOutlineQrcode } from "react-icons/ai";
import { MdUploadFile, MdOutlineInsertDriveFile } from "react-icons/md";
import { StorageContext } from "../provider/StorageProvider";
import Recorder from "../components/Recorder";
import { QRCodeSVG } from "qrcode.react";

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const api = useContext(ApiContext);
  const auth = useContext(AuthContext);
  const { setRecents } = useContext(StorageContext);
  const [lesson, setLesson] = useState<LessonWithCourse>();
  const [isLoading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (lessonId?.length !== 24) {
      return navigate("/");
    }

    api
      .getLesson(lessonId)
      .then(setLesson)
      .then(() => setLoading(false));
  }, [api, lessonId, navigate]);

  useEffect(() => {
    if (lesson) {
      setRecents({ _id: lesson._id, name: lesson.name, courseName: lesson.course.name }, false);
    }
  }, [lesson, setRecents]);

  const handleAnalyze = async () => {
    if (lesson && lessonId && !lesson?.keyPhrasesJobId) {
      await api.doLessonAnalyze(lessonId);
      setLesson(prev => ({ ...prev, keyPhrasesJobId: "1" } as LessonWithCourse));
    }
  };

  return (
    <Container maxW="container.xl" my={10}>
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Skeleton w="fit-content" isLoaded={!isLoading}>
            <Text fontSize="4xl" mb={4}>
              {lesson ? `${lesson.course.name} - ${lesson.name}` : "Loading..."}
            </Text>
          </Skeleton>
          <Skeleton w="fit-content" isLoaded={!isLoading}>
            <Text>
              {lesson?.description || "The beautiful thing about learning is nobody can take it away from you."}
            </Text>
          </Skeleton>
        </Box>
        <IconButton size="lg" aria-label="QRCode" icon={<AiOutlineQrcode />} onClick={onOpen} />
      </Flex>
      <Divider my={4} />
      {!!auth.isAuthenticated && (
        <>
          <Skeleton w="fit-content" isLoaded={!isLoading}>
            <Text my={4} fontSize="2xl">
              教師工具
            </Text>
          </Skeleton>

          <Wrap spacing={12} justify="center">
            <Skeleton w="90%" isLoaded={!isLoading}>
              <Recorder
                serverUrl={`wss://d1mdaworr0wnnd.cloudfront.net/transcribe?lid=${lessonId}`}
                isAnalyzing={!!(lesson && lesson.keyPhrasesJobId)}
                isAnalyzed={!!(lesson && lesson.keyPhrases)}
                handleAnalyze={handleAnalyze}
              />
            </Skeleton>
          </Wrap>
          <Divider my={4} />
        </>
      )}
      <Wrap spacing={4} justify="center">
        <Skeleton w={{ base: "100%", sm: "45%", lg: "30%" }} isLoaded={!isLoading}>
          <Button as={Link} to="cloud" borderRadius="xl" py={6} w="100%" h="100%" colorScheme="blue">
            <VStack spacing={2}>
              <Icon as={AiOutlineCloud} w={24} h={24} />
              <Text>課堂文字雲</Text>
            </VStack>
          </Button>
        </Skeleton>
        <Skeleton w={{ base: "100%", sm: "45%", lg: "30%" }} isLoaded={!isLoading}>
          <Button as={Link} to="notes" borderRadius="xl" py={6} w="100%" h="100%" colorScheme="green">
            <VStack spacing={2}>
              <Icon as={MdOutlineInsertDriveFile} w={24} h={24} />
              <Text>課堂筆記</Text>
            </VStack>
          </Button>
        </Skeleton>
        <Skeleton w={{ base: "100%", sm: "45%", lg: "30%" }} isLoaded={!isLoading}>
          <Button as={Link} to="upload" borderRadius="xl" py={6} w="100%" h="100%" colorScheme="orange">
            <VStack spacing={2}>
              <Icon as={MdUploadFile} w={24} h={24} />
              <Text>上傳筆記</Text>
            </VStack>
          </Button>
        </Skeleton>
      </Wrap>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>課堂 QR Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={4}>
            <QRCodeSVG value={window.location.href} includeMargin size={512} width="100%" height="auto" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default LessonView;
