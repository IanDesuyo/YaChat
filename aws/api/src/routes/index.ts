import Route from "../types/route";
import version from "./version";
import courses from "./courses";
import course from "./course";
import courseId from "./course/courseId";
import lesson from "./lesson";
import lessonId from "./lesson/lessonId";
import lessonStream from "./lesson/lessonId/stream";
import notes from "./lesson/lessonId/notes";
import note from "./lesson/lessonId/note";
import noteId from "./lesson/lessonId/note/noteId";
import noteStatus from "./lesson/lessonId/note/noteId/status";

// API Gateway resource paths
export default {
  "/": version,
  "/courses": courses,
  "/course": course,
  "/course/{courseId}": courseId,
  "/lesson": lesson,
  "/lesson/{lessonId}": lessonId,
  "/lesson/{lessonId}/stream": lessonStream,
  "/lesson/{lessonId}/notes": notes,
  "/lesson/{lessonId}/note": note,
  "/lesson/{lessonId}/note/{noteId}": noteId,
  "/lesson/{lessonId}/note/{noteId}/status": noteStatus,
} as Route;
