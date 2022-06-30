import { App } from "../../../types";
import Route from "../../../types/route";
import { APIGatewayEvent } from "aws-lambda";
import response from "../../../utils/response";
import { parseObjectId } from "../../../utils/parser";

const GET = async (app: App, event: APIGatewayEvent) => {
  const lessonId = parseObjectId(event.pathParameters.lessonId);

  const notes = await app.db.getNotes(lessonId);

  if (!notes) {
    return response(404, {
      message: "not found",
      i18n: "lesson.notFound",
    });
  }

  return response(200, {
    message: "success",
    i18n: "notes.get.success",
    data: notes,
  });
};

export default {
  GET,
} as Route;
