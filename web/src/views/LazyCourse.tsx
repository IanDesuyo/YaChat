import { useContext } from "react";
import { useLocation, Navigate, useRoutes } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";
import CourseView from "./Course";
import NewLessonView from "./NewLesson";

export const LazyCourse = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  const element = useRoutes([
    {
      path: "/:courseId",
      element: <CourseView />,
    },
    {
      path: "/:courseId/new",
      element: <NewLessonView />,
    },
  ]) || <Navigate to="/" replace />;

  return auth.isAuthenticated ? element : <Navigate to={`/login?next=${location.pathname}&s=1`} replace />;
};

export default LazyCourse;
