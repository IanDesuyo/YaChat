import { Box, Text } from "@chakra-ui/react";

interface IKeyPhraseItemProps {
  nickname: string;
  text: string;
  fileKey: string;
}

const KeyPhraseItem = ({ nickname, text, fileKey }: IKeyPhraseItemProps) => {
  const handleClick = () => {
    window.open(`${process.env.REACT_APP_S3_URL}/${fileKey}`, "_blank");
  };

  return (
    <Box w="100%">
      <Text>{nickname}</Text>
      <Box bg="gray.800" m={1} p={4} borderRadius="xl" color="white" onClick={handleClick}>
        <Text>{text}</Text>
      </Box>
    </Box>
  );
};

export default KeyPhraseItem;
