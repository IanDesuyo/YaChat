import { Box, Container, Flex, Text, VStack, Link, useColorMode, useColorModeValue } from "@chakra-ui/react";

const Footer = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box as="footer" w="100%" minH="60px" bg={useColorModeValue("white", "black")} p={4}>
      <Container maxW="container.xl">
        <Flex justifyContent="space-between">
          <VStack align="start">
            <Text fontSize="lg">YaChat 有聲 ©2022</Text>
            <Text onClick={toggleColorMode} cursor="pointer">{colorMode === "light" ? "切換為夜間模式" : "切換為日間模式"}</Text>
            <Text as={Link} href={`mailto:${process.env.REACT_APP_CONTACT_MAIL}`}>
              聯絡我們
            </Text>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
