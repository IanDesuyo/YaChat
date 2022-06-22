import { Button, Container, Text } from "@chakra-ui/react";
import CourseItem from "../components/CourseItem";

const Index = () => {
  return (
    <Container>
      <CourseItem
        course={{
          id: "1",
          name: "微積分(一)",
          description: "大一課程 必修",
          teacherId: "1",
          teacherName: "老師名稱",
          createdAt: "2020-01-01",
        }}
      />
    </Container>
  );
};

export default Index;
