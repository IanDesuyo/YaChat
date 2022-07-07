import { Box, Button, Container, Divider, FormControl, FormLabel, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";

const LoginView = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError("");
    e.preventDefault();
    e.stopPropagation();

    const email = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
    const password = e.currentTarget.elements.namedItem("password") as HTMLInputElement;

    auth
      .signIn(email.value, password.value)
      .then(session => {
        navigate(searchParams.get("next") || "/", { replace: true });
      })
      .catch(err => {
        console.log(err);
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <Container maxW="container.md" my={10}>
      <Text fontSize="4xl">登入</Text>
      {searchParams.get("s") === "1" && (
        <Text align="center" color="red.400">
          請先登入以繼續使用
        </Text>
      )}
      <Divider my={6} />
      <Box>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel htmlFor="email">電子郵件</FormLabel>
              <Input id="email" type="email" isRequired />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">密碼</FormLabel>
              <Input id="password" type="password" isRequired minLength={8} maxLength={32} />
            </FormControl>
          </VStack>
          <VStack spacing={6} mt={10}>
            {error && <Text color="red.500">{error}</Text>}
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              登入
            </Button>
            <HStack>
              <Text fontSize="sm" color="gray.500" as={NavLink} to="/signup">
                立即註冊
              </Text>
              <Divider orientation="vertical" />
              <Text fontSize="sm" color="gray.500" as={NavLink} to="/help">
                取得協助
              </Text>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default LoginView;
