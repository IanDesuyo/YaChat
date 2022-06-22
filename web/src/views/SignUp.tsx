import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";

const SignUp = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    e.stopPropagation();

    const email = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
    const password = e.currentTarget.elements.namedItem("password") as HTMLInputElement;
    const nickname = e.currentTarget.elements.namedItem("nickname") as HTMLInputElement;

    auth
      .signUp(email.value, password.value, { nickname: nickname.value })
      .then(user => {
        toast({
          title: "註冊成功",
          description: "請查看您的電子郵件，並點擊驗證信件!",
          status: "info",
          duration: null,
          isClosable: true,
        });
        navigate("/");
      })
      .catch(err => {
        console.log(err);
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <Container maxW="container.md" mt={10}>
      <Text fontSize="4xl">登入</Text>
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
            <FormControl>
              <FormLabel htmlFor="nickname">暱稱</FormLabel>
              <Input id="nickname" type="nickname" isRequired minLength={2} maxLength={32} />
            </FormControl>
          </VStack>
          <VStack spacing={6} mt={10}>
            {error && <Text color="red.500">{error}</Text>}
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              註冊
            </Button>
            <HStack>
              <Text fontSize="sm" color="gray.600" as={NavLink} to="/login">
                登入
              </Text>
              <Divider orientation="vertical" />
              <Text fontSize="sm" color="gray.600" as={NavLink} to="/help">
                取得協助
              </Text>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default SignUp;
