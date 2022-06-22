import { HashRouter, Routes, Route } from "react-router-dom";

import { Box, ChakraProvider } from "@chakra-ui/react";
import AuthProvider from "./provider/AuthProvider";
import Index from "./views/Index";
import Login from "./views/Login";
import SignUp from "./views/SignUp";
import Record from "./Record";
import TopBar from "./components/TopBar";

const App = () => {
  return (
    <ChakraProvider>
      <HashRouter>
        <AuthProvider>
          <TopBar />
          <Box mt={{ base: "5vh", md: "6vh" }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/record" element={<Record />} />
            </Routes>
          </Box>
        </AuthProvider>
      </HashRouter>
    </ChakraProvider>
  );
};

export default App;
