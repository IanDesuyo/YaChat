import { Box, Center, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { Lesson } from "../types/model";

interface ILessonItemProps {
  data: Lesson;
}
const LessonItem = ({ data }: ILessonItemProps) => {
  const dateString = new Date(data.createdAt).toLocaleDateString();

  return (
    <Box
      as={Link}
      to={`/lesson/${data._id}`}
      _hover={{ bg: useColorModeValue("gray.100", "gray.900") }}
      borderRadius="xl"
      p={4}
      w={{ base: "100%", sm: "45%", lg: "30%" }}
    >
      <Text fontSize="3xl">{data.name}</Text>
      <Text mt={2} noOfLines={1}>
        {data.description}
      </Text>
      <Flex direction={{ base: "column", lg: "row" }} justifyContent="space-between">
        <Text>共有 {data.notes}份筆記</Text>
        <Text>創建於 {dateString}</Text>
      </Flex>
    </Box>
  );
};

export const LessonItemNew = () => {
  return (
    <Box
      as={Link}
      to="new"
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
        <Text>建立課堂</Text>
        <AddIcon m={2} />
      </Center>
    </Box>
  );
};

export default LessonItem;
