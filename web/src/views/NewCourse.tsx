import { Button, Container, Divider, FormControl, FormLabel, Input, Text, VStack } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiContext } from "../provider/ApiProvider";

const NewCourseView = () => {
  const api = useContext(ApiContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError("");
    e.preventDefault();
    e.stopPropagation();

    const name = e.currentTarget.elements.namedItem("name") as HTMLInputElement;
    const description = e.currentTarget.elements.namedItem("description") as HTMLInputElement;

    api
      .createCourse({ name: name.value, description: description.value })
      .then(courseId => {
        navigate(`/course/${courseId}`);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <Container maxW="container.md" mt={10}>
      <Text fontSize="4xl">建立課程</Text>
      <Divider my={6} />
      <form onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <FormControl>
            <FormLabel htmlFor="name">課程名稱</FormLabel>
            <Input id="name" isRequired />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="description">課程簡介</FormLabel>
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

export default NewCourseView;
