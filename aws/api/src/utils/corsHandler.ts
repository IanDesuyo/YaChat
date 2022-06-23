import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import routes from "routes";

export default (event: APIGatewayEvent) => {
  const route = routes[event.path];

  if (!route) {
    return {
      statusCode: 404,
      body: null,
    } as APIGatewayProxyResult;
  }

  const methods = Object.keys(route);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN,
      "Access-Control-Allow-Methods": methods.join(","),
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    },
    body: null,
  } as APIGatewayProxyResult;
};
