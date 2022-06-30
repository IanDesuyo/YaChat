import { HashRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { Box, ChakraProvider } from "@chakra-ui/react";
import AuthProvider, { AuthContext } from "./provider/AuthProvider";
import IndexView from "./views/Index";
import LoginView from "./views/Login";
import SignUpView from "./views/SignUp";
import RecordView from "./Record";
import TopBar from "./components/TopBar";
import CoursesView from "./views/Courses";
import ApiProvider from "./provider/ApiProvider";
import CourseView from "./views/Course";
import LessonResultView from "./views/LessonResult";
import UploadNoteView from "./views/UploadNote";
import NewCourseView from "./views/NewCourse";
import NewLessonView from "./views/NewLesson";
import LessonView from "./views/Lesson";

import "./App.css";

const NeedSignIn = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  return auth.isAuthenticated ? <Outlet /> : <Navigate to={`/login?next=${location.pathname}&s=1`} replace />;
};

const App = () => {
  return (
    <ChakraProvider>
      <HashRouter>
        <AuthProvider>
          <ApiProvider>
            <TopBar />
            <Box mt={{ base: "5vh", md: "6vh" }}>
              <Routes>
                <Route path="/" element={<IndexView />} />
                <Route path="login" element={<LoginView />} />
                <Route path="signup" element={<SignUpView />} />
                <Route element={<NeedSignIn />}>
                  <Route path="/courses" element={<CoursesView />} />
                  <Route path="/course/new" element={<NewCourseView />} />
                  <Route path="/course/:courseId" element={<CourseView />} />
                  <Route path="/course/:courseId/new" element={<NewLessonView />} />
                </Route>
                <Route path="/lesson/:lessonId" element={<LessonView />} />
                <Route path="/lesson/:lessonId/cloud" element={<LessonResultView />} />
                <Route path="/lesson/:lessonId/upload" element={<UploadNoteView />} />
                <Route path="/record" element={<RecordView />} />
              </Routes>
            </Box>
          </ApiProvider>
        </AuthProvider>
      </HashRouter>
    </ChakraProvider>
  );
};

export default App;
