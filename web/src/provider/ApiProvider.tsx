import { useToast } from "@chakra-ui/react";
import { createContext, useCallback, useContext } from "react";
import { IApi, ResponseBody } from "../types/api";
import {
  Course,
  CourseCreate,
  CourseWithLessons,
  LessonCreate,
  LessonWithCourse,
  Note,
  NoteCreate,
  NoteCreateResponse,
} from "../types/model";
import { AuthContext } from "./AuthProvider";

export const ApiContext = createContext<IApi>({} as any);

const API_URL = "/v1" || "http://localhost:3001";

const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  const toast = useToast();

  const getToken = useCallback(async () => {
    if (!auth.isAuthenticated) {
      return null;
    }

    const token = await auth.getCurrentToken();

    if (!token) {
      toast({
        title: "Error",
        description: "No token",
        status: "error",
        duration: 3000,
      });

      throw new Error("No token");
    }

    return token;
  }, [auth, toast]);

  const fetchApi = useCallback(
    async (method: string, path: string, data?: any) => {
      const token = await getToken();

      const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const body = (await res.json()) as ResponseBody<any>;

      if (!res.ok) {
        toast({
          title: "Error",
          description: body.message,
          status: "error",
          duration: 5000,
        });

        throw new Error(body.message);
      }

      return { body, res };
    },
    [getToken, toast]
  );

  const getCourses = async () => {
    const { body } = await fetchApi("GET", "/courses");
    const courses = body.data as Course[];

    return courses;
  };

  const getCourse = async (courseId: string) => {
    const { body } = await fetchApi("GET", `/course/${courseId}`);
    const course = body.data as CourseWithLessons;

    return course;
  };

  const createCourse = async (course: CourseCreate) => {
    const { body } = await fetchApi("POST", "/course", course);
    const courseId = body.data as string;

    return courseId;
  };

  const getLesson = async (lessonId: string) => {
    const { body } = await fetchApi("GET", `/lesson/${lessonId}`);
    const lesson = body.data as LessonWithCourse;

    return lesson;
  };

  const createLesson = async (lesson: LessonCreate) => {
    const { body } = await fetchApi("POST", "/lesson", lesson);
    const lessonId = body.data as string;

    return lessonId;
  };

  const getNotes = async (lessonId: string) => {
    const { body } = await fetchApi("GET", `/lesson/${lessonId}/notes`);
    const notes = body.data as Note[];

    return notes;
  };

  const createNote = async (lessonId: string, data: NoteCreate) => {
    const { body } = await fetchApi("POST", `/lesson/${lessonId}/note`, data);
    const note = body.data as NoteCreateResponse;

    return note;
  };

  return (
    <ApiContext.Provider
      value={{ fetchApi, getCourses, getCourse, createCourse, getLesson, createLesson, getNotes, createNote }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
