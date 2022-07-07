import Route from "../types/route";
import version from "./version";
import courses from "./courses";
import course from "./course";
import courseId from "./course/courseId";
import lesson from "./lesson";
import lessonId from "./lesson/lessonId";
import lessonStream from "./lesson/lessonId/stream";
import lessonNotes from "./lesson/lessonId/notes";
import lessonNote from "./lesson/lessonId/note";
import noteId from "./lesson/lessonId/note/noteId";
import noteStatus from "./lesson/lessonId/note/noteId/status";
import lessonAnalyze from "./lesson/lessonId/analyze";

// API Gateway resource paths
export default {
  "/": version,
  "/courses": courses,
  "/course": course,
  "/course/{courseId}": courseId,
  "/lesson": lesson,
  "/lesson/{lessonId}": lessonId,
  "/lesson/{lessonId}/stream": lessonStream,
  "/lesson/{lessonId}/notes": lessonNotes,
  "/lesson/{lessonId}/analyze": lessonAnalyze,
  "/lesson/{lessonId}/note": lessonNote,
  "/lesson/{lessonId}/note/{noteId}": noteId,
  "/lesson/{lessonId}/note/{noteId}/status": noteStatus,
} as Route;
