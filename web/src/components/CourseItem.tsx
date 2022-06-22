import { Box, Text } from "@chakra-ui/react";
import { ICourseItemProps } from "../types/components/CourseItem.d";

const CourseItem = ({ course }: ICourseItemProps) => {
  return (
    <Box bg="gray.200">
      <Text fontSize="3xl">{course.name}</Text>
      <Text>{course.description}</Text>
    </Box>
  );
};

export default CourseItem;
