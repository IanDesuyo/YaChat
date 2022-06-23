import { App } from "../../../types";
import Route from "../../../types/route";
import { APIGatewayEvent } from "aws-lambda";
import response from "../../../utils/response";
import { parseObjectId } from "../../../utils/parser";

const GET = async (app: App, event: APIGatewayEvent) => {
  const lessonId = parseObjectId(event.pathParameters.lessonId);

  const lesson = await app.db.getLesson(lessonId);

  if (!lesson) {
    return response(404, {
      message: "not found",
      i18n: "lesson.notFound",
    });
  }

  return response(200, {
    message: "success",
    i18n: "course.get.success",
    data: lesson,
  });
};

export default {
  GET,
} as Route;
