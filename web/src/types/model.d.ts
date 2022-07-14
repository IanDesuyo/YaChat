export interface CourseCreate {
  name: string;
  description: string;
}

export interface NewCourse extends CourseCreate {
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface Course extends NewCourse {
  _id: string;
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export interface _LessonCreate<stringT> {
  name: string;
  description: string;
  courseId: stringT;
}

export interface LessonCreate extends _LessonCreate<string> {}

export interface NewLesson extends _LessonCreate<string> {
  createdAt: string;
}

export interface Lesson extends NewLesson {
  _id: string;
  keyPhrases?: KeyPhrase[];
  keyPhrasesJobId?: string;
  notes: number;
}

export interface LessonWithCourse extends Lesson {
  course: Course;
}

export interface NoteFile {
  key: string;
  textractResult?: TextractBlock[];
  textractContent?: string;
}

export interface fileAttribute {
  size: number;
  type: string;
}

export interface _NoteCreate {
  nickname: string;
}

export interface NoteCreate extends _NoteCreate {
  files: fileAttribute[];
}

export interface NewNote extends _NoteCreate {
  lessonId: string;
  key: string;
  files: NoteFile[];
  createdAt: string;
}

export interface Note extends NewNote {
  _id: string;
  keyPhrases?: KeyPhrase[];
}

export interface KeyPhrase {
  text: string;
  score: number;
}

export interface TextractBlock {
  text: string;
  type: string;
  confidence: number;
  boundingBox: {
    top: number;
    left: number;
    height: number;
    width: number;
  };
  id: string;
  relationships?: {
    type: string;
    ids: string[];
  }[];
}

export interface NoteCreateResponse {
  noteId: string;
  uploadUrls: string[];
}

export interface NoteStatusResponse {
  incomplete: number;
  completed: number;
  analyzed: boolean;
}
