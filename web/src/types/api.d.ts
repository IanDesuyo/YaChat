import { Course, CourseCreate, CourseWithLessons, LessonWithCourse, LessonCreate, NoteCreateResponse } from "./model";

export interface ResponseBody<T> {
  message?: string;
  i18n?: string;
  data?: T;
}

export interface IApi {
  fetchApi: (method: string, path: string, data?: any) => Promise<{ body: ResponseBody<any>; res: Response }>;
  getCourses: () => Promise<Course[]>;
  getCourse: (courseId: string) => Promise<CourseWithLessons>;
  createCourse: (course: CourseCreate) => Promise<string>;
  getLesson: (lessonId: string) => Promise<LessonWithCourse>;
  getLessonStreamUrl: (lessonId: string) => Promise<string>;
  createLesson: (lesson: LessonCreate) => Promise<string>;
  getNotes: (lessonId: string) => Promise<Note[]>;
  getNote: (lessonId: string, noteId: string) => Promise<Note>;
  createNote: (lessonId: string, data: NoteCreate) => Promise<NoteCreateResponse>;
  getNoteStatus: (lessonId: string, noteId: string) => Promise<NoteStatusResponse>;
  doLessonAnalyze: (lessonId: string) => Promise<void>;
}
