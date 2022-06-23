import { App } from "types";
import Route from "types/route";
import { APIGatewayProxyEventBase, APIGatewayProxyCognitoAuthorizer } from "aws-lambda";
import response from "utils/response";
import { LessonCreate } from "types/model";
import { parseObjectId } from "utils/parser";

const POST = async (app: App, event: APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizer>) => {
  const payload = JSON.parse(event.body) as LessonCreate;
  const courseId = parseObjectId(payload.courseId);

  const course = await app.db.getCourse(courseId);

  if (!course) {
    return response(404, {
      message: "not found",
      i18n: "course.notFound",
    });
  }

  const lessonId = await app.db.createLesson({
    ...payload,
    courseId,
    createdAt: new Date(),
  });

  return response(200, {
    message: "success",
    i18n: "lesson.create.success",
    data: lessonId,
  });
};

export default {
  POST,
} as Route;
