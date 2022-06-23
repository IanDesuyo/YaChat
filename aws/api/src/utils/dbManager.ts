import { Db, ObjectId } from "mongodb";
import * as model from "types/model";

export default class DBManager {
  db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async getCourses(teacherId: string) {
    const courses = await this.db.collection("courses").aggregate().match({ teacherId }).toArray();
    return courses as model.Course[];
  }

  async getCourse(courseId: ObjectId) {
    // TODO: get lessons
    const course = await this.db
      .collection("courses")
      .aggregate()
      .match({ _id: courseId })
      .lookup({
        from: "lessons",
        localField: "_id",
        foreignField: "courseId",
        as: "lessons",
      })
      .next();

    return course as model.CourseWithLessons;
  }

  async createCourse(course: model.NewCourse) {
    const result = await this.db.collection("courses").insertOne(course);
    return result.insertedId;
  }

  async getLesson(lessonId: ObjectId) {
    const lesson = await this.db
      .collection("lessons")
      .aggregate()
      .match({ _id: lessonId })
      .lookup({
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      })
      .unwind("$course")
      .next();

    return lesson as model.LessonWithCourse;
  }

  async createLesson(lesson: model.NewLesson) {
    const result = await this.db.collection("lessons").insertOne(lesson);
    return result.insertedId;
  }

  async getNotes(lessonId: ObjectId) {
    const notes = await this.db.collection("notes").aggregate().match({ lessonId }).toArray();

    return notes as model.Note[];
  }

  async getNote(noteId: ObjectId) {
    const note = await this.db.collection("notes").aggregate().match({ _id: noteId }).next();

    return note as model.Note;
  }

  async createNote(note: model.NewNote) {
    const result = await this.db.collection("notes").insertOne(note);
    return result.insertedId;
  }

  async updateNote(noteId: ObjectId, data: Partial<model.Note>) {
    const result = await this.db.collection("notes").updateOne({ _id: noteId }, { $set: data });

    return result.modifiedCount === 1;
  }
}
