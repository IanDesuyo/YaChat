import { APIGatewayProxyResult } from "aws-lambda";

export default () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN,
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    },
    body: null,
  } as APIGatewayProxyResult;
};
