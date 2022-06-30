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
} from "@chakra-ui/react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WordCloudBox from "../components/WordCloud";
import { ApiContext } from "../provider/ApiProvider";
import { Note } from "../types/model";
import { Dimension, ListEntry } from "wordcloud";
import KeyPhraseItem from "../components/KeyPhraseItem";
import { useCallback } from "react";

const LessonResultView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const api = useContext(ApiContext);
  const [notes, setNotes] = useState<Note[]>();
  const [isLoading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState<[string, number][]>([]);
  const [selected, setSelected] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    const ranking: { [key: string]: number } = {};

    notes?.forEach(note => {
      note.keyPhrases?.forEach(keyPhrase => {
        if (ranking[keyPhrase.text]) {
          ranking[keyPhrase.text]++;
        } else {
          ranking[keyPhrase.text] = 1;
        }
      });
    });

    const sorted = Object.entries(ranking).sort((a, b) => b[1] - a[1]);

    setKeywords(sorted);
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

  return (
    <>
      {isLoading ? (
        <Center mt="40vh">
          <VStack spacing={4}>
            <Spinner size="xl" speed="1s" />
            <Text>正在載入... 請稍後</Text>
          </VStack>
        </Center>
      ) : (
        <WordCloudBox
          words={keywords}
          onClick={handleClick}
          style={{ width: "100%", height: "100%", position: "fixed" }}
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
    </>
  );
};

export default LessonResultView;
