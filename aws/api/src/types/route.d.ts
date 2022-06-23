import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { App } from "types";

export interface Path {
  GET?: (app: App, event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;
  POST?: (app: App, event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;
  PUT?: (app: App, event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;
  DELETE?: (app: App, event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;
}

export default interface Route {
  [key: string]: Path;
}
