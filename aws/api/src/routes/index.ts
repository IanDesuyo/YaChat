import Route from "../types/route";
import courses from "./courses";
import course from "./course";
import courseId from "./course/courseId";
import version from "./version";
import lesson from "./lesson";
import lessonId from "./lesson/lessonId";
import lessonStream from "./lesson/lessonId/stream";

// API Gateway resource paths
export default {
  "/": version,
  "/courses": courses,
  "/course": course,
  "/course/{courseId}": courseId,
  "/lesson": lesson,
  "/lesson/{lessonId}": lessonId,
  "/lesson/{lessonId}/stream": lessonStream,
} as Route;
