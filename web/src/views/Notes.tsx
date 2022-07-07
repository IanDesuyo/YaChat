import { Container, Skeleton, VStack } from "@chakra-ui/react";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import NoteBox from "../components/NoteBox";
import { ApiContext } from "../provider/ApiProvider";
import { Note } from "../types/model";

const NotesView = () => {
  const { lessonId } = useParams();
  const api = useContext(ApiContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId?.length !== 24) {
      return;
    }

    api
      .getNotes(lessonId)
      .then(setNotes)
      .then(() => setLoading(false));
  }, [api, lessonId]);
  return (
    <Container maxW="container.lg" my={10}>
      <VStack spacing={2}>
        {isLoading
          ? [...new Array(4)].map((_, index) => <Skeleton key={index} w="100%" h="240px" />)
          : notes.map((note, index) => <NoteBox key={index} note={note} />)}
      </VStack>
    </Container>
  );
};

export default NotesView;
