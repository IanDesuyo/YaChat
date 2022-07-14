import { HashRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Box, ChakraProvider } from "@chakra-ui/react";
import AuthProvider from "./provider/AuthProvider";
import StorageProvider from "./provider/StorageProvider";
import IndexView from "./views/Index";
import LoginView from "./views/Login";
import SignUpView from "./views/SignUp";
import RecordView from "./Record";
import TopBar from "./components/TopBar";
import ApiProvider from "./provider/ApiProvider";
import LessonResultView from "./views/LessonResult";
import LessonTeacherResultView from "./views/LessonTeacherResult";
import UploadNoteView from "./views/UploadNote";
import LessonView from "./views/Lesson";
import NotesView from "./views/Notes";

import "./App.css";
import CustomSpinner from "./components/Spinner";

const LazyLoad = ({ component }: { component: string }) => {
  const Component = lazy(() => import(`./views/${component}`));

  return (
    <Suspense fallback={<CustomSpinner />}>
      <Component />
    </Suspense>
  );
};

const App = () => {
  return (
    <ChakraProvider>
      <HashRouter>
        <AuthProvider>
          <ApiProvider>
            <StorageProvider>
              <TopBar />
              <Box mt={{ base: "5vh", md: "6vh" }} minH="90vh">
                <Routes>
                  <Route path="/" element={<IndexView />} />
                  <Route path="login" element={<LoginView />} />
                  <Route path="signup" element={<SignUpView />} />
                  <Route path="/course/*" element={<LazyLoad component="LazyCourse.tsx" />} />
                  <Route path="/courses/*" element={<LazyLoad component="LazyCourses.tsx" />} />
                  <Route path="/lesson/:lessonId" element={<LessonView />} />
                  <Route path="/lesson/:lessonId/notes" element={<NotesView />} />
                  <Route path="/lesson/:lessonId/cloud" element={<LessonResultView />} />
                  <Route path="/lesson/:lessonId/teachercloud" element={<LessonTeacherResultView />} />
                  <Route path="/lesson/:lessonId/upload" element={<UploadNoteView />} />
                  <Route path="/record" element={<RecordView />} />
                </Routes>
              </Box>
            </StorageProvider>
          </ApiProvider>
        </AuthProvider>
      </HashRouter>
    </ChakraProvider>
  );
};

export default App;
