import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  HStack,
  VStack,
  Collapse,
  Link,
  useDisclosure,
  Divider,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  Center,
  MenuDivider,
  MenuItem,
} from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "課程管理",
    href: "/courses",
  },
  {
    label: "上課紀錄",
    href: "/notes",
  },
  {
    label: "常見問題",
    href: "/help",
  },
];

const TopBar = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box as="header" position="fixed" w="100%" top="0">
      <Flex
        bg="white"
        color="gray.600"
        h={{ base: "5vh", md: "6vh" }}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle="solid"
        borderColor="gray.200"
        align="center"
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant="ghost"
            aria-label="Toggle Navigation"
          />
        </Flex>

        <Flex flex={{ base: "auto", md: 1 }} justify={{ base: "center", md: "start" }}>
          <Text
            as={NavLink}
            to="/"
            fontSize="xl"
            textAlign={{ base: "center", md: "left" }}
            color="gray.800"
          >
            YaChat有聲
          </Text>

          <Flex display={{ base: "none", md: "flex" }}>
            <Divider orientation="vertical" mx={15} />
            <HStack spacing={6}>
              {NAV_ITEMS.map((navItem, index) => (
                <Box key={index}>
                  <Link
                    as={NavLink}
                    to={navItem.href}
                    p={2}
                    fontSize="sm"
                    fontWeight={500}
                    color="black"
                    _hover={{
                      textDecoration: "none",
                      color: "gray.500",
                    }}
                    _activeLink={{
                      borderBottom: 1,
                      borderStyle: "solid",
                    }}
                  >
                    {navItem.label}
                  </Link>
                </Box>
              ))}
            </HStack>
          </Flex>
        </Flex>

        <HStack flex={{ base: 1, md: 0 }} justify={"flex-end"} direction={"row"} spacing={4}>
          <AccountMenu />
        </HStack>
      </Flex>

      <Collapse
        in={isOpen}
        animateOpacity
        style={{
          background: "white",
          position: "fixed",
          zIndex: 1,
          width: "100%",
          minHeight: "100%",
        }}
      >
        <VStack p={4} spacing={4} display={{ md: "none" }}>
          {NAV_ITEMS.map((navItem, index) => (
            <Box key={index}>
              <Link
                as={NavLink}
                to={navItem.href}
                color="black"
                _hover={{
                  textDecoration: "none",
                }}
                _activeLink={{
                  fontWeight: 600,
                }}
                onClick={onToggle}
              >
                {navItem.label}
              </Link>
            </Box>
          ))}
        </VStack>
      </Collapse>
    </Box>
  );
};

export default TopBar;

const AccountMenu = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    let currentPath = window.location.pathname;
    if (currentPath === "/login" || currentPath === "/register") {
      currentPath = "/";
    }

    navigate(`/login?next=${currentPath}`);
  };

  return auth.isAuthenticated ? (
    <Menu>
      <MenuButton as={Button} rounded="full" variant="link" cursor="pointer" minW={0}>
        <Avatar name={auth.user?.attributes.nickname} size="sm" />
      </MenuButton>
      <MenuList p={4}>
        <Center>
          <Avatar name={auth.user?.attributes.nickname} size="2xl" />
        </Center>
        <Center mt={2}>
          <Text fontSize="xl">{auth.user?.attributes.nickname}</Text>
        </Center>
        <MenuDivider />
        <MenuItem as={NavLink} to="/user/me">
          個人資料
        </MenuItem>
        <MenuItem as={NavLink} to="/user/me/likes">
          我的最愛
        </MenuItem>
        <MenuItem onClick={auth.signOut}>登出</MenuItem>
      </MenuList>
    </Menu>
  ) : (
    <>
      <Button fontSize="sm" fontWeight={400} bg="white" onClick={handleLogin}>
        登入
      </Button>
      <Button
        as={NavLink}
        to="/signup"
        display={{ base: "none", md: "inline-flex" }}
        fontSize="sm"
        fontWeight={600}
        color="white"
        bg="pink.400"
        _hover={{
          bg: "pink.300",
        }}
      >
        註冊
      </Button>
    </>
  );
};
