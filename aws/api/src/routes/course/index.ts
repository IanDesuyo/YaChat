import { App } from "../../types";
import Route from "../../types/route";
import { APIGatewayProxyEventBase, APIGatewayProxyCognitoAuthorizer } from "aws-lambda";
import response from "../../utils/response";
import { CourseCreate } from "../../types/model";

const POST = async (app: App, event: APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizer>) => {
  const { sub, nickname } = event.requestContext.authorizer.claims;
  const payload = JSON.parse(event.body) as CourseCreate;

  const courseId = await app.db.createCourse({
    ...payload,
    teacherId: sub,
    teacherName: nickname,
    createdAt: new Date(),
  });

  return response(200, {
    message: "success",
    i18n: "course.create.success",
    data: courseId,
  });
};

export default {
  POST,
} as Route;
