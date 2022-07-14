import { useContext } from "react";
import { useLocation, Navigate, useRoutes } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";
import CoursesView from "./Courses";
import NewCourseView from "./NewCourse";

export const LazyCourses = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  const element = useRoutes([
    {
      path: "/",
      element: <CoursesView />,
    },
    {
      path: "/new",
      element: <NewCourseView />,
    },
  ]) || <Navigate to="/" replace />;

  return auth.isAuthenticated ? element : <Navigate to={`/login?next=${location.pathname}&s=1`} replace />;
};

export default LazyCourses;
