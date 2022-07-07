import {
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Spinner,
  useDisclosure,
  VStack,
  Text,
  Container,
  Button,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WordCloudBox from "../components/WordCloud";
import { ApiContext } from "../provider/ApiProvider";
import { Note } from "../types/model";
import { Dimension, ListEntry } from "wordcloud";
import KeyPhraseItem from "../components/KeyPhraseItem";
import { useCallback } from "react";
import wordRanking from "../utils/wordRanking";

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

    return resultItem;
  }, [notes, selected]);

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

  return (
    <>
      {isLoading ? (
        <Center mt="40vh">
          <VStack spacing={4}>
            <Spinner size="xl" speed="1s" />
            <Text>正在載入... 請稍後</Text>
          </VStack>
        </Center>
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
          <DrawerCloseButton />
          <DrawerHeader>{selected}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>{result}</VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Button display={isLoading ? "none" : undefined} position="absolute" right="0" onClick={handleEasyView}>
        EZ View
      </Button>
    </>
  );
};

export default LessonResultView;
