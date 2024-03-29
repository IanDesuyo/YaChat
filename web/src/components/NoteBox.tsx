import { Box, HStack, Image, Text, useColorModeValue } from "@chakra-ui/react";
import { Note } from "../types/model";

interface INoteBoxProps {
  note: Note;
}

const NoteBox = ({ note }: INoteBoxProps) => {
  return (
    <Box _hover={{ bg: useColorModeValue("gray.100", "gray.900") }} borderRadius="xl" p={4} w="100%">
      <Text fontSize="xl">{note.nickname}</Text>
      <Text>共{note.files.length}個檔案</Text>
      <HStack overflowX="scroll">
        {note.files.map((file, index) => (
          <Image
            key={index}
            src={`${process.env.REACT_APP_S3_URL}/${file.key}`}
            boxSize="256px"
            objectFit="cover"
            className="noteImage"
            onClick={() => window.open(`${process.env.REACT_APP_S3_URL}/${file.key}`)}
            cursor="zoom-in"
          />
        ))}
      </HStack>
    </Box>
  );
};

export default NoteBox;
