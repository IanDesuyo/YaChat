import { VStack, Text, Container, Button } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WordCloudBox from "../components/WordCloud";
import { ApiContext } from "../provider/ApiProvider";
import wordRanking from "../utils/wordRanking";
import CustomSpinner from "../components/Spinner";

const LessonTeacherResultView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const api = useContext(ApiContext);
  const [isLoading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState<[string, number][]>([]);
  const [useEasyView, setUseEasyView] = useState(() => {
    const easyView = localStorage.getItem("easyView");
    return easyView ? JSON.parse(easyView) : false;
  });

  useEffect(() => {
    if (lessonId?.length !== 24) {
      return navigate("/");
    }

    api.getLesson(lessonId).then(lesson => {
      if (!lesson) {
        return navigate("/");
      }

      const { keyPhrases } = lesson;
      const keywords = wordRanking([{ keyPhrases } as any]);
      setKeywords(keywords);
      setLoading(false);
    });
  }, [api, lessonId, navigate]);

  const handleEasyView = () => {
    setUseEasyView(!useEasyView);
    localStorage.setItem("easyView", JSON.stringify(!useEasyView));
  };

  return (
    <>
      <Button
        display={isLoading ? "none" : undefined}
        position="absolute"
        right="0"
        onClick={handleEasyView}
        zIndex="modal"
      >
        EZ View
      </Button>
      {isLoading ? (
        <CustomSpinner />
      ) : useEasyView ? (
        <Container maxW="container.xl" my={10}>
          <VStack align="left" spacing={4}>
            {keywords.map(([word, count], index) => (
              <Text
                key={index}
                fontSize={index < 5 ? "4xl" : index < 10 ? "3xl" : index < 15 ? "2xl" : index < 20 ? "xl" : "lg"}
              >
                {word}
              </Text>
            ))}
          </VStack>
        </Container>
      ) : (
        <WordCloudBox words={keywords} style={{ width: "100%", height: "95%", position: "fixed" }} />
      )}
    </>
  );
};

export default LessonTeacherResultView;
