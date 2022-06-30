import { Skeleton, Text, Container, Divider, Wrap, Button, Icon, VStack } from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ApiContext } from "../provider/ApiProvider";
import { AuthContext } from "../provider/AuthProvider";
import { LessonWithCourse } from "../types/model";
import { AiOutlineCloud } from "react-icons/ai";
import { MdUploadFile, MdOutlineInsertDriveFile, MdOutlineRecordVoiceOver } from "react-icons/md";

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const api = useContext(ApiContext);
  const auth = useContext(AuthContext);
  const [lesson, setLesson] = useState<LessonWithCourse>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId?.length !== 24) {
      return navigate("/");
    }

    api
      .getLesson(lessonId)
      .then(setLesson)
      .then(() => setLoading(false));
  }, [api, lessonId, navigate]);

  return (
    <Container maxW="container.xl">
      <Skeleton w="fit-content" isLoaded={!isLoading}>
        <Text fontSize="4xl" mb={4}>
          {lesson ? `${lesson.course.name} - ${lesson.name}` : "Loading..."}
        </Text>
      </Skeleton>
      <Skeleton w="fit-content" isLoaded={!isLoading}>
        <Text>{lesson?.description || "The beautiful thing about learning is nobody can take it away from you."}</Text>
      </Skeleton>
      <Divider my={4} />
      {!!auth.isAuthenticated && (
        <>
          <Skeleton w="fit-content" isLoaded={!isLoading}>
            <Text my={4} fontSize="2xl">
              教師工具
            </Text>
          </Skeleton>

          <Wrap spacing={4}>
            <Skeleton w={{ base: "100%", sm: "45%", lg: "30%" }} isLoaded={!isLoading}>
              <Button as={Link} to="record" borderRadius="xl" py={6} w="100%" h="100%">
                <VStack spacing={2}>
                  <Icon as={MdOutlineRecordVoiceOver} w={24} h={24} />
                  <Text>錄音分析</Text>
                </VStack>
              </Button>
            </Skeleton>
          </Wrap>
          <Divider my={4} />
        </>
      )}
      <Wrap spacing={4}>
        <Skeleton w={{ base: "100%", sm: "45%", lg: "30%" }} isLoaded={!isLoading}>
          <Button as={Link} to="cloud" borderRadius="xl" py={6} w="100%" h="100%" colorScheme="cyan">
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
    </Container>
  );
};

export default LessonView;