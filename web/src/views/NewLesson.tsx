import { Button, Container, Divider, FormControl, FormLabel, Input, Text, VStack } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiContext } from "../provider/ApiProvider";

const NewLessonView = () => {
  const api = useContext(ApiContext);
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (courseId?.length !== 24) {
      return navigate("/courses");
    }
  }, [courseId, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError("");
    e.preventDefault();
    e.stopPropagation();

    const name = e.currentTarget.elements.namedItem("name") as HTMLInputElement;
    const description = e.currentTarget.elements.namedItem("description") as HTMLInputElement;

    if (!courseId) {
      setError("發生錯誤, 請重新整理頁面");
      return setLoading(false);
    }

    api
      .createLesson({ name: name.value, description: description.value, courseId })
      .then(lessonId => {
        navigate(`/lesson/${lessonId}`);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <Container maxW="container.md" my={10}>
      <Text fontSize="4xl">建立課堂</Text>
      <Divider my={6} />
      <form onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <FormControl>
            <FormLabel htmlFor="name">課堂名稱</FormLabel>
            <Input id="name" isRequired />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="description">課堂簡介</FormLabel>
            <Input id="description" isRequired />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            建立
          </Button>
        </VStack>
      </form>
    </Container>
  );
};

export default NewLessonView;
