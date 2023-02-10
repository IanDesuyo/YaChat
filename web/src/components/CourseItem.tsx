import { Box, Center, Text, useColorModeValue } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { Course } from "../types/model";

interface ICourseItemProps {
  data: Course;
}

const CourseItem = ({ data }: ICourseItemProps) => {
  return (
    <Box
      as={Link}
      to={`/course/${data._id}`}
      _hover={{ bg: useColorModeValue("gray.100", "gray.900") }}
      borderRadius="xl"
      p={4}
      w={{ base: "100%", sm: "45%", lg: "30%" }}
    >
      <Text fontSize="3xl">{data.name}</Text>
      <Text textAlign="end">{data.teacherName}老師</Text>
      <Text mt={2} noOfLines={1}>
        {data.description}
      </Text>
    </Box>
  );
};

export const CourseItemNew = () => {
  return (
    <Box
      as={Link}
      to="/courses/new"
      _hover={{ bg: useColorModeValue("gray.100", "gray.900") }}
      borderRadius="xl"
      p={4}
      w={{ base: "100%", sm: "45%", lg: "30%" }}
    >
      <Center
        h="100%"
        color={useColorModeValue("gray.600", "gray.400")}
        _hover={{ color: useColorModeValue("black", "white") }}
      >
        <Text>建立課程</Text>
        <AddIcon m={2} />
      </Center>
    </Box>
  );
};

export default CourseItem;
