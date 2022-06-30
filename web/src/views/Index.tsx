import { Box, Button, Center, Container, Flex, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import WordCloudBox from "../components/WordCloud";
import { AuthContext } from "../provider/AuthProvider";

const IndexView = () => {
  const auth = useContext(AuthContext);

  return (
    <Box>
      <Box w="100%" h="94vh" bg="pink.100" id="main-sec1">
        <Center h="100%">
          <Flex
            w="90%"
            h="100%"
            direction={{ base: "column", lg: "row" }}
            justifyContent={{ base: "auto", lg: "space-between" }}
          >
            <Flex direction="column" justifyContent="center" w="100%">
              <Text fontSize={96} fontWeight="bold" id="main-sec1-title" lineHeight={1.2}>
                Ya Chat 有聲
              </Text>
              <Text fontSize={40} display="grid">
                讓您的課堂不在 枯燥乏味
              </Text>
              {auth.isAuthenticated ? (
                <Button w="fit-content" px={10} mt={8} as={Link} to="/courses" colorScheme="blue">
                  開始使用
                </Button>
              ) : (
                <Button w="fit-content" px={10} mt={8} as={Link} to="/signup" colorScheme="blue">
                  立即註冊
                </Button>
              )}
            </Flex>
            <WordCloudBox
              words={[
                ["互動", 10],
                ["教學", 8],
                ["學習", 4],
              ]}
              options={{
                weightFactor: function (s) {
                  return (Math.pow(s, 1.1) / 192) * window.innerWidth;
                },
                color: "random-light",
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
              id="main-word-cloud"
              useDiv
            />
          </Flex>
        </Center>
      </Box>
      <Container>
        <Box>協助您檢視教學成果</Box>
      </Container>
    </Box>
  );
};

export default IndexView;
