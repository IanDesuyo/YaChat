import { Center, Container, Spinner, Text, Wrap } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import CourseItem, { CourseItemNew } from "../components/CourseItem";
import { ApiContext } from "../provider/ApiProvider";
import { Course } from "../types/model";

const CoursesView = () => {
  const api = useContext(ApiContext);
  const [isLoading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api
      .getCourses()
      .then(setCourses)
      .then(() => setLoading(false));
  }, [api]);

  return (
    <Container maxW="container.xl">
      <Text fontSize="4xl">您的課程</Text>
      {isLoading ? (
        <Center mt={20}>
          <Spinner size="xl" speed="1s" />
        </Center>
      ) : (
        <Wrap spacing={4}>
          {courses.map(course => (
            <CourseItem data={course} key={course._id} />
          ))}
          <CourseItemNew />
        </Wrap>
      )}
    </Container>
  );
};

export default CoursesView;
