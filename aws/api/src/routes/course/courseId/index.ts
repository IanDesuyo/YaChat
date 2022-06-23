import { App } from "types";
import Route from "types/route";
import { APIGatewayProxyEventBase, APIGatewayProxyCognitoAuthorizer } from "aws-lambda";
import response from "utils/response";
import { parseObjectId } from "utils/parser";

const GET = async (app: App, event: APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizer>) => {
  const courseId = parseObjectId(event.pathParameters.courseId);

  const course = await app.db.getCourse(courseId);

  if (!course) {
    return response(404, {
      message: "not found",
      i18n: "course.notFound",
    });
  }

  return response(200, {
    message: "success",
    i18n: "course.get.success",
    data: course,
  });
};

export default {
  GET,
} as Route;
