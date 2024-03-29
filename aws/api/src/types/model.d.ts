import { ObjectId } from "mongodb";

declare interface CourseCreate {
  name: string;
  description: string;
}

declare interface NewCourse extends CourseCreate {
  teacherId: string;
  teacherName: string;
  createdAt: Date;
}

declare interface Course extends NewCourse {
  _id: ObjectId;
}

declare interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

declare interface _LessonCreate<ObjectIdT> {
  name: string;
  description: string;
  courseId: ObjectIdT;
}

declare interface LessonCreate extends _LessonCreate<string> {}

declare interface NewLesson extends _LessonCreate<ObjectId> {
  createdAt: Date;
}

declare interface Lesson extends NewLesson {
  _id: ObjectId;
  keyPhrases?: KeyPhrase[];
  keyPhrasesJobId: string;
  notes: number;
}

declare interface LessonWithCourse extends Lesson {
  course: Course;
}

declare interface NoteFile {
  key: string;
  textractResult?: TextractBlock[];
  textractContent?: string;
}

declare interface fileAttribute {
  size: number;
  type: string;
}

declare interface _NoteCreate {
  nickname: string;
}

declare interface NoteCreate extends _NoteCreate {
  files: fileAttribute[];
}

declare interface NewNote extends _NoteCreate {
  lessonId: ObjectId;
  key: string;
  files: NoteFile[];
  createdAt: Date;
}

declare interface Note extends NewNote {
  _id: ObjectId;
  keyPhrases?: KeyPhrase[];
}

declare interface KeyPhrase {
  text: string;
  score: number;
}

declare interface TextractBlock {
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
