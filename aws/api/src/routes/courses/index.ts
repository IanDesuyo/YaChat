import { App } from "../../types";
import Route from "../../types/route";
import { APIGatewayProxyEventBase, APIGatewayProxyCognitoAuthorizer } from "aws-lambda";
import response from "../../utils/response";

const GET = async (app: App, event: APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizer>) => {
  const { sub } = event.requestContext.authorizer.claims;

  const courses = await app.db.getCourses(sub);

  return response(200, {
    message: "success",
    i18n: "courses.get.success",
    data: courses,
  });
};

export default {
  GET,
} as Route;
