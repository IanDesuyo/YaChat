declare interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

declare interface Lesson {
  id: string;
  courseId: string;
  name: string;
  createdAt: string;
}

declare interface StudentNote {
  id: string;
  lessonId: string;
  nickname: string;
  fileKeys: string[];
  createdAt: string;
}
