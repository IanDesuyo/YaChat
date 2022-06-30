import { Container, Divider, Skeleton, Text, Wrap } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LessonItem, { LessonItemNew } from "../components/LessonItem";
import { ApiContext } from "../provider/ApiProvider";
import { CourseWithLessons } from "../types/model";

const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const api = useContext(ApiContext);
  const [course, setCourse] = useState<CourseWithLessons>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId?.length !== 24) {
      return navigate("/courses");
    }

    api
      .getCourse(courseId)
      .then(setCourse)
      .then(() => setLoading(false));
  }, [api, courseId, navigate]);

  return (
    <Container maxW="container.xl">
      <Skeleton w="fit-content" isLoaded={!isLoading}>
        <Text fontSize="4xl" mb={4}>
          {course?.name || "Loading..."}
        </Text>
      </Skeleton>
      <Skeleton w="fit-content" isLoaded={!isLoading}>
        <Text>{course?.description || "The beautiful thing about learning is nobody can take it away from you."}</Text>
      </Skeleton>
      <Divider my={4} />
      <Skeleton w="fit-content" isLoaded={!isLoading}>
        <Text fontSize="2xl">此課程的上課紀錄</Text>
      </Skeleton>
      <Wrap spacing={4}>
        {isLoading ? (
          [...new Array(9)].map((_, index) => (
            <Skeleton key={index} w={{ base: "100%", sm: "45%", lg: "30%" }} h="96px" />
          ))
        ) : (
          <>
            {course?.lessons.map(lesson => (
              <LessonItem data={lesson} key={lesson._id} />
            ))}
            <LessonItemNew />
          </>
        )}
      </Wrap>
    </Container>
  );
};

export default CourseView;
