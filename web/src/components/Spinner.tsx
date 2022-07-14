import { Center, VStack, Text, Spinner } from "@chakra-ui/react";

const CustomSpinner = () => {
  return (
    <Center mt="40vh">
      <VStack spacing={4}>
        <Spinner size="xl" speed="1s" />
        <Text>Loading...</Text>
      </VStack>
    </Center>
  );
};

export default CustomSpinner;
