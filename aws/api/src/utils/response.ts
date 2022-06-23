import { APIGatewayProxyResult } from "aws-lambda";
import { ResponseBody } from "types/response";

/**
 * Create a response object.
 * @param statusCode - The response status code
 * @param body - The response body
 * @returns - The response object
 */
export default (statusCode: number, body: ResponseBody, ...props: any[]) => {
  const bodyString = JSON.stringify(body);
  return {
    statusCode,
    body: bodyString,
    headers: {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN,
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    },
    ...props,
  } as APIGatewayProxyResult;
};
