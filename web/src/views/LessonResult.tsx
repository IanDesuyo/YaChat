import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  VStack,
  Text,
  Container,
  Button,
  Flex,
  CloseButton,
  Select,
  HStack,
} from "@chakra-ui/react";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WordCloudBox from "../components/WordCloud";
import { ApiContext } from "../provider/ApiProvider";
import { Dimension, ListEntry } from "wordcloud";
import KeyPhraseItem from "../components/KeyPhraseItem";
import { useCallback } from "react";
import wordRanking from "../utils/wordRanking";
import CustomSpinner from "../components/Spinner";
import { Note } from "../types/model";

const LessonResultView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const api = useContext(ApiContext);
  const [notes, setNotes] = useState<Note[]>();
  const [isLoading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState<[string, number][]>([]);
  const [selected, setSelected] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [useEasyView, setUseEasyView] = useState(() => {
    const easyView = localStorage.getItem("easyView");
    return easyView ? JSON.parse(easyView) : false;
  });
  const [sortBy, setSortBy] = useState<string>(() => {
    const sortBy = localStorage.getItem("sortBy");
    return sortBy ? sortBy : "default";
  });

  useEffect(() => {
    if (lessonId?.length !== 24) {
      return navigate("/");
    }

    api
      .getNotes(lessonId)
      .then(setNotes)
      .then(() => setLoading(false));
  }, [api, lessonId, navigate]);

  useEffect(() => {
    if (notes) {
      const ranking = wordRanking(notes);

      setKeywords(ranking);
    }
  }, [notes]);

  const result = useMemo(() => {
    const resultItem: JSX.Element[] = [];

    if (notes && selected) {
      notes.forEach(note => {
        note.files.forEach(file => {
          file.textractResult?.forEach(block => {
            if (block.type === "LINE" && block.text.toLocaleLowerCase().includes(selected)) {
              resultItem.push(<KeyPhraseItem nickname={note.nickname} text={block.text} fileKey={file.key} />);
            }
          });
        });
      });
    }

    return resultItem.sort((a, b) => {
      if (sortBy === "student") {
        return a.props.nickname.localeCompare(b.props.nickname);
      } else if (sortBy === "length") {
        return b.props.text.length - a.props.text.length;
      }
      return 0;
    });
  }, [notes, selected, sortBy]);

  const handleClick = useCallback(
    (item: ListEntry, dimension: Dimension, event: MouseEvent) => {
      setSelected(item[0]);
      onOpen();
    },
    [onOpen]
  );

  const handleClose = () => {
    setSelected(undefined);
    onClose();
  };

  const handleEasyView = () => {
    setUseEasyView(!useEasyView);
    localStorage.setItem("easyView", JSON.stringify(!useEasyView));
  };

  const handleSortBy = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!["default", "student", "length"].includes(event.target.value)) {
      return;
    }
    setSortBy(event.target.value);
    localStorage.setItem("sortBy", JSON.stringify(event.target.value));
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
                onClick={() => {
                  setSelected(word);
                  onOpen();
                }}
              >
                {word}
              </Text>
            ))}
          </VStack>
        </Container>
      ) : (
        <WordCloudBox
          words={keywords}
          onClick={handleClick}
          style={{ width: "100%", height: "95%", position: "fixed" }}
        />
      )}
      <Drawer isOpen={isOpen} onClose={handleClose} placement="right" size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Flex justifyContent="space-between" alignItems="center">
              {selected}
              <HStack>
                <Select placeholder="排列方式" value={sortBy} onChange={handleSortBy}>
                  <option value="default">預設</option>
                  <option value="student">學生名稱</option>
                  <option value="length">段落字數</option>
                </Select>
                <CloseButton onClick={handleClose} />
              </HStack>
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>{result}</VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default LessonResultView;
