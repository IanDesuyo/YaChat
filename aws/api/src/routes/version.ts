import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { App } from "../types";
import response from "../utils/response";
import { Path } from "../types/route";
const packageJson = require("../../package.json");

const GET = async (app: App, event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  return response(200, {
    message: "Hello World!",
    i18n: "hello.world",
    data: {
      version: packageJson.version,
    },
  });
};

export default {
  GET,
} as Path;
