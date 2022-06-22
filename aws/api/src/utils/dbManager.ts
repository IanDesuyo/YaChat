import { MongoClient, Db, ObjectId } from "mongodb";
import * as model from "../types/model";

export default class DBManager {
  db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async getCourses(teacherId: string) {
    const courses = await this.db.collection("courses").find({ teacherId }).toArray();
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
}
